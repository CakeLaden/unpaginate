import { chromium } from "playwright";
import { dedupeKey } from "./dedupe.js";
import { extractItemFields } from "./extract.js";
import { fingerprintPageContent } from "./fingerprint.js";
import {
  nextUrlForParamIncrement,
  nextUrlForTemplate,
  resolveNextLinkAction
} from "./pagination/resolveNext.js";
import { unpaginateConfigSchema, type ResultRow } from "./types.js";

export type RunOptions = {
  headed?: boolean;
  storageStatePath?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runUnpaginate(
  rawConfig: unknown,
  options: RunOptions = {}
): Promise<{ results: ResultRow[]; stoppedReason: string }> {
  const config = unpaginateConfigSchema.parse(rawConfig);

  const maxPages = config.maxPages ?? 10_000;
  const maxItems = config.maxItems ?? Number.POSITIVE_INFINITY;
  const delayMs = config.delayMs ?? 0;
  const emptyPagesBeforeStop = config.emptyPagesBeforeStop ?? 1;
  const navTimeout = config.navigationTimeoutMs ?? 60_000;
  const waitItemTimeout = config.waitForItemTimeoutMs ?? 30_000;

  const browser = await chromium.launch({
    headless: !options.headed
  });
  const context = await browser.newContext(
    options.storageStatePath
      ? { storageState: options.storageStatePath }
      : {}
  );
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(navTimeout);

  let currentUrl = config.startUrl;
  let lastFingerprint: string | null = null;
  let consecutiveEmpty = 0;
  const results: ResultRow[] = [];
  const seen = new Set<string>();
  let stoppedReason = "completed";

  try {
    for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
      await page.goto(currentUrl, { waitUntil: "domcontentloaded" });
      if (delayMs > 0) {
        await sleep(delayMs);
      }

      const html = await page.content();
      const fp = fingerprintPageContent(html);
      if (pageIndex > 0 && lastFingerprint !== null && fp === lastFingerprint) {
        stoppedReason = "duplicate_page_fingerprint";
        break;
      }
      lastFingerprint = fp;

      let itemHandles: Awaited<ReturnType<typeof page.$$>> = [];
      try {
        await page.waitForSelector(config.itemSelector, {
          timeout: waitItemTimeout,
          state: "attached"
        });
        itemHandles = await page.$$(config.itemSelector);
      } catch {
        itemHandles = [];
      }

      let addedThisPage = 0;
      for (const h of itemHandles) {
        if (results.length >= maxItems) {
          stoppedReason = "max_items";
          break;
        }
        const fields = await extractItemFields(h, config.extract);
        const row: ResultRow = {
          ...fields,
          _meta: { pageUrl: page.url(), pageIndex }
        };
        if (config.dedupeBy) {
          const key = dedupeKey(row, config.dedupeBy);
          if (seen.has(key)) {
            continue;
          }
          seen.add(key);
        }
        results.push(row);
        addedThisPage++;
      }

      for (const h of itemHandles) {
        await h.dispose();
      }

      if (stoppedReason === "max_items") {
        break;
      }

      if (results.length >= maxItems) {
        stoppedReason = "max_items";
        break;
      }

      if (addedThisPage === 0) {
        consecutiveEmpty++;
        if (consecutiveEmpty >= emptyPagesBeforeStop) {
          stoppedReason = "empty_pages";
          break;
        }
      } else {
        consecutiveEmpty = 0;
      }

      if (pageIndex + 1 >= maxPages) {
        stoppedReason = "max_pages";
        break;
      }

      const p = config.pagination;
      if (p.type === "paramIncrement") {
        const step = p.step ?? 1;
        const start = p.start ?? 1;
        const nextUrl = nextUrlForParamIncrement(
          page.url(),
          p.param,
          step,
          start
        );
        if (nextUrl === page.url()) {
          stoppedReason = "no_next_url";
          break;
        }
        currentUrl = nextUrl;
        continue;
      }

      if (p.type === "urlTemplate") {
        const startPage = p.startPage ?? 1;
        const step = p.step ?? 1;
        const nextUrl = nextUrlForTemplate(
          p.template,
          pageIndex,
          startPage,
          step
        );
        if (nextUrl === page.url()) {
          stoppedReason = "same_url";
          break;
        }
        currentUrl = nextUrl;
        continue;
      }

      if (p.type === "nextLink") {
        const action = await resolveNextLinkAction(page, p);
        if (action.kind === "done") {
          stoppedReason = "no_next_page";
          break;
        }
        if (action.kind === "goto") {
          if (action.url === page.url()) {
            stoppedReason = "same_url";
            break;
          }
          currentUrl = action.url;
          continue;
        }
        const before = page.url();
        await Promise.all([
          page.waitForNavigation({ waitUntil: "domcontentloaded" }),
          page.click(action.selector)
        ]);
        const after = page.url();
        if (after === before) {
          stoppedReason = "same_url_after_click";
          break;
        }
        currentUrl = after;
        continue;
      }
    }
  } finally {
    await browser.close();
  }

  return { results, stoppedReason };
}
