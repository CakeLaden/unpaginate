/**
 * Headed scrape of Audible wishlist + library.
 * If Audible asks to sign in, complete it in the Chromium window.
 * Saves refreshed auth.json and JSON dumps under out/.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(".");
const authPath = resolve(root, "auth.json");
const outDir = resolve(root, "out");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: false,
  slowMo: 50
});
const context = await contextWithAuth(browser);
const page = await context.newPage();
page.setDefaultTimeout(120_000);

async function contextWithAuth(browser) {
  try {
    return await browser.newContext({
      storageState: authPath,
      viewport: { width: 1400, height: 900 }
    });
  } catch {
    return await browser.newContext({ viewport: { width: 1400, height: 900 } });
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForSignedIn(page) {
  const deadline = Date.now() + 12 * 60_000;
  console.log(
    "Sign in in the Chromium window if asked. Waiting up to 12 minutes for the list to load."
  );
  while (Date.now() < deadline) {
    try {
      await page.waitForLoadState("domcontentloaded").catch(() => {});
      const url = page.url();
      const title = await page.title().catch(() => "");
      const signedOut =
        /\/ap\/signin/i.test(url) ||
        /amazon sign in/i.test(title) ||
        (await page.locator("#ap_email, #ap_password, input[name='email']").count()) > 0;
      const hasItems =
        (await page.locator("li.bc-list-item.productListItem").count()) > 0 ||
        (await page.locator("div.adbl-library-content-row, [id^='adbl-library-content-row']").count()) >
          0 ||
        (await page.locator("li.bc-list-item[id^='product-list-item-']").count()) > 0;
      if (!signedOut && hasItems) {
        console.log("Signed in. List items visible.");
        return true;
      }
      console.log(`waiting… ${String(title).slice(0, 60)} | ${url.slice(0, 90)}`);
    } catch (err) {
      const msg = String(err?.message || err);
      if (/destroyed|navigation|Target closed/i.test(msg)) {
        console.log("waiting… (page navigated during sign-in)");
      } else {
        throw err;
      }
    }
    await sleep(2000);
  }
  return false;
}

function extractItemsFromPage() {
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();

  const rows = [
    ...document.querySelectorAll("li.bc-list-item.productListItem"),
    ...document.querySelectorAll("li.bc-list-item[id^='product-list-item-']"),
    ...document.querySelectorAll("div.adbl-library-content-row"),
    ...document.querySelectorAll("[id^='adbl-library-content-row']")
  ];
  const seen = new Set();
  const items = [];
  for (const el of rows) {
    if (seen.has(el)) continue;
    seen.add(el);
    const titleEl =
      el.querySelector("h3.bc-heading a") ||
      el.querySelector("h2.bc-heading a") ||
      el.querySelector("h3.bc-heading") ||
      el.querySelector("h2.bc-heading") ||
      el.querySelector("a[href*='/pd/']");
    const title = clean(titleEl?.textContent || "");
    if (!title) continue;
    const href =
      el.querySelector("a[href*='/pd/']")?.getAttribute("href") ||
      titleEl?.getAttribute?.("href") ||
      "";
    const labelText = (cls) => clean(el.querySelector(`.${cls}`)?.textContent || "");
    const allText = clean(el.innerText || "");
    const priceMatch =
      allText.match(/\$\d[\d,]*(?:\.\d{2})/) ||
      allText.match(/Buy for \$[\d.]+/i);
    const durationMatch = allText.match(/Length:\s*[\w\s]+?(?=\n|$|Release|Rating|By:)/i);
    const creditsMatch = allText.match(/\d+\s+credit/i);
    items.push({
      title,
      subtitle: clean(
        el.querySelector("li.bc-list-item.subtitle, span.subtitle")?.textContent || ""
      ),
      author: labelText("authorLabel") || clean(allText.match(/By:\s*([^\n]+)/)?.[1] || ""),
      narrator: labelText("narratorLabel"),
      duration: labelText("runtimeLabel") || durationMatch?.[0] || "",
      releaseDate: labelText("releaseDateLabel"),
      series: labelText("seriesLabel"),
      category: labelText("categoriesLabel") || labelText("genreLabel"),
      price: priceMatch ? priceMatch[0] : "",
      credits: creditsMatch ? creditsMatch[0] : "",
      href,
      summary: clean(
        el.querySelector(".bc-text.bc-overflow-hidden, .bc-pub-overflow-x-hidden, p.bc-text")
          ?.textContent || ""
      ).slice(0, 800),
      snippet: allText.slice(0, 1200)
    });
  }
  return items;
}

async function scrapeList(page, startUrl, name, maxPages = 30) {
  console.log(`\nScraping ${name}: ${startUrl}`);
  await page.goto(startUrl, { waitUntil: "domcontentloaded" });
  const ok = await waitForSignedIn(page);
  if (!ok) {
    console.log(`Timed out waiting for ${name} to load while signed in.`);
    return { items: [], stoppedReason: "signin_timeout" };
  }
  await context.storageState({ path: authPath });
  console.log("Saved storage state.");

  const all = [];
  const seen = new Set();
  let empty = 0;
  for (let i = 0; i < maxPages; i++) {
    const url = startUrl.replace(/page=\d+/, `page=${i + 1}`);
    if (i > 0) {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await sleep(600);
    }
    const items = await page.evaluate(extractItemsFromPage);
    console.log(`  page ${i + 1}: ${items.length} items`);
    let added = 0;
    for (const item of items) {
      const key = item.href || item.title;
      if (seen.has(key)) continue;
      seen.add(key);
      all.push({ ...item, page: i + 1 });
      added++;
    }
    if (added === 0) {
      empty++;
      if (empty >= 2) break;
    } else {
      empty = 0;
    }
    const nextDisabled =
      (await page.locator(".nextButton.bc-button-disabled, .bc-button.nextButton[aria-disabled='true']").count()) >
      0;
    const nextLink = page.locator("a.nextButton, a[aria-label='Next'], .nextButton a").first();
    if (nextDisabled || (await nextLink.count()) === 0) break;
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const jsonPath = resolve(outDir, `${name}-${stamp}.json`);
  await writeFile(
    jsonPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), count: all.length, results: all }, null, 2)
  );
  console.log(`Wrote ${all.length} ${name} items -> ${jsonPath}`);
  return { items: all, jsonPath };
}

try {
  await page.goto("https://www.audible.com/library/wishlist?pageSize=50&page=1", {
    waitUntil: "domcontentloaded"
  });
  const wishlist = await scrapeList(
    page,
    "https://www.audible.com/library/wishlist?pageSize=50&page=1",
    "audible-wishlist",
    10
  );
  const library = await scrapeList(
    page,
    "https://www.audible.com/library/titles?pageSize=50&page=1",
    "audible-library",
    40
  );
  await writeFile(
    resolve(outDir, "audible-lists-latest.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        wishlist: wishlist.items,
        library: library.items
      },
      null,
      2
    )
  );
  console.log("DONE", {
    wishlist: wishlist.items.length,
    library: library.items.length
  });
} finally {
  await browser.close();
}
