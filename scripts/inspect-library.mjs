/**
 * Dump Audible library page HTML/selectors using fresh auth.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const outDir = resolve("out/inspect");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ storageState: resolve("auth.json") });
const page = await context.newPage();

const urls = [
  ["library-titles", "https://www.audible.com/library/titles?pageSize=50&page=1"],
  ["library", "https://www.audible.com/library"],
  ["library-titles-alt", "https://www.audible.com/library?ref=a_library_t_c6_libLib_0"]
];

for (const [name, url] of urls) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(2500);
  const title = await page.title();
  const finalUrl = page.url();
  const html = await page.content();
  await writeFile(resolve(outDir, `${name}.html`), html);
  const info = await page.evaluate(() => {
    const selectors = [
      "li.bc-list-item.productListItem",
      "li.bc-list-item[id^='product-list-item-']",
      "div.adbl-library-content-row",
      "[id^='adbl-library-content-row']",
      "li.bc-list-item",
      "[class*='library']",
      "adbl-library-content-row",
      "table tr",
      "[data-asin]"
    ];
    const counts = {};
    for (const s of selectors) counts[s] = document.querySelectorAll(s).length;
    return {
      counts,
      h1: document.querySelector("h1")?.textContent?.trim() || "",
      bodySlice: (document.body?.innerText || "").slice(0, 2500)
    };
  });
  console.log("\n===", name, "===");
  console.log("title:", title);
  console.log("url:", finalUrl);
  console.log("html length", html.length);
  console.log(JSON.stringify(info.counts, null, 2));
  console.log("h1:", info.h1);
  console.log(info.bodySlice.slice(0, 800));
}

await browser.close();
