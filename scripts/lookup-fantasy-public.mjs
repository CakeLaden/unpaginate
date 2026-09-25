/**
 * Public Audible catalog lookup for likely-fantasy wishlist titles.
 * No login required. Writes out/audible-fantasy-public.json
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const titles = [
  ["Jonathan Strange & Mr Norrell", "Susanna Clarke", "historical fantasy"],
  ["Piranesi", "Susanna Clarke", "literary fantasy"],
  ["The Shadow of the Torturer", "Gene Wolfe", "literary fantasy"],
  ["The Last Unicorn", "Peter S. Beagle", "literary fantasy"],
  ["The Blade Itself", "Joe Abercrombie", "grimdark fantasy"],
  ["Circe", "Madeline Miller", "mythic fantasy"],
  ["Babel", "R. F. Kuang", "dark academia fantasy"],
  ["Howl's Moving Castle", "Diana Wynne Jones", "YA fantasy"],
  ["The House in the Cerulean Sea", "TJ Klune", "cozy fantasy"],
  ["A Court of Thorns and Roses", "Sarah J. Maas", "romantasy"],
  ["The Fellowship of the Ring", "J. R. R. Tolkien", "epic fantasy"],
  ["The Silmarillion", "J. R. R. Tolkien", "epic fantasy"],
  ["The Invisible Life of Addie LaRue", "V. E. Schwab", "contemporary fantasy"],
  ["The Gunslinger", "Stephen King", "dark fantasy"],
  ["Watership Down", "Richard Adams", "animal fantasy"],
  ["Cinderella and the Beast", "Kim Bussing", "fairy-tale romance"],
  ["Always Coming Home", "Ursula K. Le Guin", "anthropological SF/fantasy"],
  ["The Witch", "Marie NDiaye", "literary"],
  ["Kafka on the Shore", "Haruki Murakami", "magical realism"],
  ["The Midnight Library", "Matt Haig", "contemporary speculative"],
  ["The Alchemist", "Paulo Coelho", "allegorical fable"],
  ["Mythos", "Stephen Fry", "mythology retelling"],
  ["Heroes", "Stephen Fry", "mythology retelling"],
  ["The Divine Comedy", "Dante", "epic poem"],
  ["Stuart Little", "E. B. White", "children's fantasy"]
];

const outDir = resolve("out");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  locale: "en-US"
});
const page = await context.newPage();
page.setDefaultTimeout(45_000);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const results = [];

for (const [title, author, lane] of titles) {
  const q = encodeURIComponent(`${title} ${author} audiobook`);
  const searchUrl = `https://www.audible.com/search?keywords=${q}`;
  const row = {
    queryTitle: title,
    queryAuthor: author,
    lane,
    searchUrl
  };
  try {
    await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
    await sleep(900);

    const hit = await page.evaluate(({ wantTitle, wantAuthor }) => {
      const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
      const norm = (s) =>
        clean(s)
          .toLowerCase()
          .replace(/&/g, "and")
          .replace(/[^a-z0-9 ]/g, " ")
          .replace(/\s+/g, " ");
      const wantT = norm(wantTitle);
      const wantA = norm(wantAuthor).split(" ").filter((w) => w.length > 2);
      const items = [
        ...document.querySelectorAll("li.bc-list-item.productListItem"),
        ...document.querySelectorAll("li.bc-list-item[id^='product-list-item-']")
      ];
      const parsed = items.map((el) => {
        const t = clean(
          el.querySelector("h3.bc-heading a, h3.bc-heading")?.textContent || ""
        );
        const a = clean(el.querySelector(".authorLabel")?.textContent || "");
        const all = clean(el.innerText || "");
        const price = (all.match(/\$\d[\d,]*(?:\.\d{2})/) || [""])[0];
        return {
          title: t,
          author: a,
          narrator: clean(el.querySelector(".narratorLabel")?.textContent || ""),
          duration: clean(el.querySelector(".runtimeLabel")?.textContent || ""),
          series: clean(el.querySelector(".seriesLabel")?.textContent || ""),
          price,
          href: el.querySelector("a[href*='/pd/']")?.getAttribute("href") || "",
          snippet: all.slice(0, 900)
        };
      });
      const scored = parsed
        .map((p) => {
          const t = norm(p.title);
          const a = norm(p.author);
          let score = 0;
          if (t.includes(wantT) || wantT.includes(t.slice(0, 24))) score += 5;
          if (wantA.every((w) => a.includes(w))) score += 5;
          else if (wantA.some((w) => a.includes(w))) score += 2;
          return { p, score };
        })
        .filter((x) => x.score >= 5)
        .sort((x, y) => y.score - x.score);
      return scored[0]?.p || parsed[0] || null;
    }, { wantTitle: title, wantAuthor: author });

    Object.assign(row, hit || { error: "no_search_hit" });

    if (hit?.href) {
      const pd = hit.href.startsWith("http")
        ? hit.href
        : `https://www.audible.com${hit.href.split("?")[0]}`;
      row.productUrl = pd;
      await page.goto(pd, { waitUntil: "domcontentloaded" });
      await sleep(700);
      const detail = await page.evaluate(() => {
        const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
        const text = clean(document.body?.innerText || "");
        const price =
          (text.match(/\$\d[\d,]*(?:\.\d{2})/) || [""])[0] ||
          clean(
            document.querySelector(
              ".adbl-prod-price, .buybox-regular-price, .bc-color-price, p.bc-text[id*='price']"
            )?.textContent || ""
          );
        const summaryEl =
          document.querySelector(".productPublisherSummary") ||
          document.querySelector("#adbl-ad-blurb-content") ||
          document.querySelector(".bc-section .bc-box .bc-text") ||
          document.querySelector("[data-trigger='summary']");
        const cats = [...document.querySelectorAll("a[href*='/cat/']")]
          .map((a) => clean(a.textContent))
          .filter((t) => t && t.length < 40)
          .slice(0, 8);
        return {
          pageTitle: clean(document.querySelector("h1")?.textContent || ""),
          duration:
            clean(document.querySelector(".runtimeLabel")?.textContent || "") ||
            (text.match(/Length:\s*[\w and]+mins?/) || [""])[0],
          narrator: clean(document.querySelector(".narratorLabel")?.textContent || ""),
          author: clean(document.querySelector(".authorLabel")?.textContent || ""),
          price,
          categories: [...new Set(cats)],
          summary: clean(summaryEl?.innerText || "").slice(0, 1200)
        };
      });
      row.detail = detail;
      if (!row.price && detail.price) row.price = detail.price;
      if (!row.duration && detail.duration) row.duration = detail.duration;
      if (detail.summary) row.summary = detail.summary;
      if (detail.categories?.length) row.categories = detail.categories;
    }

    console.log(
      `${results.length + 1}/${titles.length} ${title} | ${row.duration || "?"} | ${row.price || "?"} | ${row.title || "NO HIT"}`
    );
  } catch (err) {
    row.error = err.message;
    console.log(`FAIL ${title}: ${err.message}`);
  }
  results.push(row);
}

const outPath = resolve(outDir, "audible-fantasy-public.json");
await writeFile(
  outPath,
  JSON.stringify({ generatedAt: new Date().toISOString(), count: results.length, results }, null, 2)
);
await browser.close();
console.log("wrote", outPath);
