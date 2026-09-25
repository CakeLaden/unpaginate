/**
 * Look up public Audible catalog pages for known wishlist titles.
 * Does not require login. Writes out/audible-wishlist-public.json
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const titles = [
  ["Klara and the Sun", "Kazuo Ishiguro"],
  ["There Is No Antimemetics Division", "qntm"],
  ["Kafka on the Shore", "Haruki Murakami"],
  ["Underworld", "Don DeLillo"],
  ["Flowers for Algernon", "Daniel Keyes"],
  ["Siddhartha", "Herman Hesse"],
  ["Jonathan Strange & Mr Norrell", "Susanna Clarke"],
  ["The Shadow of the Torturer", "Gene Wolfe"],
  ["The Midnight Library", "Matt Haig"],
  ["A Cage Went in Search of a Bird", "Tommy Orange"],
  ["Bel Canto", "Ann Patchett"],
  ["How to Listen to and Understand Great Music", "Robert Greenberg"],
  ["The Art of Reading", "Timothy Spurgin"],
  ["Writing Great Fiction", "James Hynes"],
  ["Lonesome Dove", "Larry McMurtry"],
  ["Little Eyes", "Samanta Schweblin"],
  ["The Dutch House", "Ann Patchett"],
  ["Normal People", "Sally Rooney"],
  ["Circe", "Madeline Miller"],
  ["Babel", "R. F. Kuang"],
  ["Piranesi", "Susanna Clarke"],
  ["Yr Dead", "Sam Sax"],
  ["Martyr!", "Kaveh Akbar"],
  ["The Heart in Winter", "Kevin Barry"],
  ["Transcription", "Ben Lerner"],
  ["The Gunslinger", "Stephen King"],
  ["The Language of the Night", "Ursula K. Le Guin"],
  ["The Last Unicorn", "Peter S. Beagle"],
  ["The Kings of Cool", "Don Winslow"],
  ["The Dispossessed", "Ursula K. Le Guin"],
  ["The Lathe of Heaven", "Ursula K. Le Guin"],
  ["Children of Time", "Adrian Tchaikovsky"],
  ["The Blade Itself", "Joe Abercrombie"],
  ["And Then There Were None", "Agatha Christie"],
  ["Drive Your Plow Over the Bones of the Dead", "Olga Tokarczuk"],
  ["Stuart Little", "E. B. White"],
  ["Watership Down", "Richard Adams"],
  ["Flatland", "Edwin Abbott"],
  ["The Age of Grief", "Jane Smiley"],
  ["I Who Have Never Known Men", "Jacqueline Harpman"],
  ["Tomorrow, and Tomorrow, and Tomorrow", "Gabrielle Zevin"],
  ["Always Coming Home", "Ursula K. Le Guin"],
  ["Five Ways to Forgiveness", "Ursula K. Le Guin"],
  ["A Hologram for the King", "Dave Eggers"],
  ["A Heartbreaking Work of Staggering Genius", "Dave Eggers"],
  ["A Court of Thorns and Roses", "Sarah J. Maas"],
  ["Thus Spoke Zarathustra", "Friedrich Nietzsche"],
  ["Artemis", "Andy Weir"],
  ["The End of the Affair", "Graham Greene"],
  ["Howl's Moving Castle", "Diana Wynne Jones"],
  ["The Covenant of Water", "Abraham Verghese"],
  ["The Corrections", "Jonathan Franzen"],
  ["Middlesex", "Jeffrey Eugenides"],
  ["Contact", "Carl Sagan"],
  ["Stranger in a Strange Land", "Robert A. Heinlein"],
  ["Foundation", "Isaac Asimov"],
  ["Underland", "Robert Macfarlane"],
  ["Is a River Alive?", "Robert Macfarlane"],
  ["The Count of Monte Cristo", "Alexandre Dumas"],
  ["East of Eden", "John Steinbeck"],
  ["Anxious People", "Fredrik Backman"],
  ["Nabokov's Favorite Word Is Mauve", "Ben Blatt"],
  ["The House in the Cerulean Sea", "TJ Klune"],
  ["The Witch", "Marie NDiaye"],
  ["Against Interpretation", "Susan Sontag"],
  ["The Divine Comedy", "Dante"],
  ["The Goldfinch", "Donna Tartt"],
  ["Heroes", "Stephen Fry"],
  ["Mythos", "Stephen Fry"],
  ["One Day, Everyone Will Have Always Been Against This", "Omar El Akkad"],
  ["The Color Purple", "Alice Walker"],
  ["The Magic Mountain", "Thomas Mann"],
  ["On the Road", "Jack Kerouac"],
  ["Wise Blood", "Flannery O'Connor"],
  ["A Good Man Is Hard To Find", "Flannery O'Connor"],
  ["The White Album", "Joan Didion"],
  ["Slouching Towards Bethlehem", "Joan Didion"],
  ["The Wild Robot", "Peter Brown"],
  ["Paradais", "Fernanda Melchor"],
  ["Cinderella and the Beast", "Kim Bussing"],
  ["The Fellowship of the Ring", "J. R. R. Tolkien"],
  ["Atomic Habits", "James Clear"],
  ["The Correspondent", "Virginia Evans"],
  ["Theo of Golden", "Allen Levi"],
  ["The Invisible Life of Addie LaRue", "V. E. Schwab"],
  ["The Silmarillion", "J. R. R. Tolkien"],
  ["The Getaway", "Jim Thompson"],
  ["The Remains of the Day", "Kazuo Ishiguro"],
  ["Things in Nature Merely Grow", "Yiyun Li"],
  ["Rebecca", "Daphne du Maurier"],
  ["Brave New World", "Aldous Huxley"],
  ["The Hitchhiker's Guide to the Galaxy", "Douglas Adams"],
  ["The Alchemist", "Paulo Coelho"],
  ["Fahrenheit 451", "Ray Bradbury"],
  ["Moby-Dick", "Herman Melville"]
];

const outDir = resolve("out");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
});
const page = await context.newPage();

function clean(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function extractFirstResult() {
  const el =
    document.querySelector("li.bc-list-item.productListItem") ||
    document.querySelector("li.bc-list-item[id^='product-list-item-']");
  if (!el) return null;
  const titleEl = el.querySelector("h3.bc-heading a, h3.bc-heading");
  const allText = clean(el.innerText || "");
  const price =
    (allText.match(/\$\d[\d,]*(?:\.\d{2})/) || [])[0] ||
    clean(el.querySelector(".buybox-regular-price, .bc-color-price")?.textContent || "");
  return {
    title: clean(titleEl?.textContent || ""),
    author: clean(el.querySelector(".authorLabel")?.textContent || ""),
    narrator: clean(el.querySelector(".narratorLabel")?.textContent || ""),
    duration: clean(el.querySelector(".runtimeLabel")?.textContent || ""),
    series: clean(el.querySelector(".seriesLabel")?.textContent || ""),
    price,
    href: el.querySelector("a[href*='/pd/']")?.getAttribute("href") || "",
    snippet: allText.slice(0, 1500)
  };
}

const results = [];
for (const [title, author] of titles) {
  const q = encodeURIComponent(`${title} ${author}`);
  const url = `https://www.audible.com/search?keywords=${q}&k=${q}`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.waitForTimeout(700);
    const hit = await page.evaluate(extractFirstResult);
    results.push({ queryTitle: title, queryAuthor: author, searchUrl: url, ...hit });
    console.log(
      `${results.length}/${titles.length} ${title} -> ${hit?.title || "NO HIT"} | ${hit?.duration || ""} | ${hit?.price || ""}`
    );
  } catch (err) {
    console.log(`FAIL ${title}: ${err.message}`);
    results.push({ queryTitle: title, queryAuthor: author, error: err.message });
  }
}

await writeFile(
  resolve(outDir, "audible-wishlist-public.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), count: results.length, results }, null, 2)
);
await browser.close();
console.log("wrote", results.length);
