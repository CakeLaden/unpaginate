/**
 * Dump first-item HTML from Audible wishlist and library so we can set selectors.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const outDir = resolve("out/inspect");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: resolve("auth.json"),
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
});
const page = await context.newPage();

async function inspect(name, url, selectors) {
  console.log(`\n=== ${name} ===`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(2500);
  const title = await page.title();
  const finalUrl = page.url();
  console.log("title:", title);
  console.log("url:", finalUrl);

  const signedOut =
    /sign in|sign-in|signin/i.test(title) ||
    /\/sign-?in/i.test(finalUrl) ||
    (await page.locator("text=Sign In").count()) > 0;

  const html = await page.content();
  await writeFile(resolve(outDir, `${name}-page.html`), html);
  console.log("wrote page html, length", html.length, "signedOutGuess", signedOut);

  for (const sel of selectors) {
    const count = await page.locator(sel).count();
    console.log(`  ${sel}: ${count}`);
  }

  for (const sel of selectors) {
    const first = page.locator(sel).first();
    if ((await first.count()) === 0) continue;
    const outer = await first.evaluate((n) => n.outerHTML);
    await writeFile(resolve(outDir, `${name}-first-item.html`), outer);
    console.log(`  first item via ${sel}: ${outer.length} chars`);
    break;
  }
}

try {
  await inspect("wishlist", "https://www.audible.com/library/wishlist?pageSize=50&page=1", [
    "li.bc-list-item.productListItem",
    "li.bc-list-item[id^='product-list-item-']",
    "div.adbl-library-content-row",
    "li[id^='adbl-library-content-row']",
    ".productListItem",
    "[data-widget='productList'] li"
  ]);

  await inspect("library", "https://www.audible.com/library/titles?pageSize=50&page=1", [
    "div.adbl-library-content-row",
    "li.bc-list-item.productListItem",
    "li.bc-list-item[id^='adbl-library-content-row']",
    "[id^='adbl-library-content-row']",
    "li.bc-list-item[id^='product-list-item-']",
    ".adbl-library-content-row"
  ]);
} finally {
  await browser.close();
}
