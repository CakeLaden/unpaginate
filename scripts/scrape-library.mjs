/**
 * Scrape Audible library titles using saved auth.json.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const outDir = resolve("out");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ storageState: resolve("auth.json") });
const page = await context.newPage();
page.setDefaultTimeout(60_000);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const all = [];
const seen = new Set();
let empty = 0;

for (let i = 1; i <= 40; i++) {
  const url = `https://www.audible.com/library/titles?pageSize=50&page=${i}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await sleep(800);
  if (/\/ap\/signin/i.test(page.url())) {
    console.log("Signed out on library scrape");
    break;
  }
  const items = await page.evaluate(() => {
    const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
    return [...document.querySelectorAll("div.adbl-library-content-row")].map((el) => {
      const title =
        clean(el.querySelector("span.bc-size-headline3")?.textContent || "") ||
        [...el.querySelectorAll("a[href*='/pd/']")]
          .map((a) => clean(a.textContent || ""))
          .find((t) => t && !/^preview$/i.test(t)) ||
        "";
      const allText = clean(el.innerText || "");
      const href =
        [...el.querySelectorAll("a[href*='/pd/']")]
          .map((a) => a.getAttribute("href") || "")
          .find((h) => h) || "";
      const dur =
        allText.match(/\b\d+h(?:\s+\d+m)?\b/i)?.[0] ||
        allText.match(/\b\d+m\b/)?.[0] ||
        allText.match(/Length:\s*[\w\s]+mins?/i)?.[0] ||
        "";
      return {
        title,
        author: (allText.match(/By:\s*([^\n]+?)(?:\s+Narrated by:|$)/i) || [, ""])[1],
        narrator: (allText.match(/Narrated by:\s*([^\n]+?)(?:\s+interactive|$)/i) || [, ""])[1],
        duration: dur,
        href,
        summary: clean(
          [...el.querySelectorAll("p, span.bc-text")]
            .map((n) => clean(n.textContent || ""))
            .find((t) => t.length > 80 && !t.startsWith("By:") && t !== title) || ""
        ).slice(0, 700),
        snippet: allText.slice(0, 900)
      };
    });
  });
  let added = 0;
  for (const item of items) {
    if (!item.title) continue;
    const key = item.href || item.title;
    if (seen.has(key)) continue;
    seen.add(key);
    all.push({ ...item, page: i });
    added++;
  }
  console.log(`page ${i}: ${items.length} rows, +${added} unique (total ${all.length})`);
  if (added === 0) {
    empty++;
    if (empty >= 2) break;
  } else {
    empty = 0;
  }
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const jsonPath = resolve(outDir, `audible-library-${stamp}.json`);
await writeFile(
  jsonPath,
  JSON.stringify({ generatedAt: new Date().toISOString(), count: all.length, results: all }, null, 2)
);
console.log("wrote", all.length, jsonPath);
await browser.close();
