/**
 * Kindle Single Scoop curated picks (Featured sort, 200 pages), shortest first.
 * Run: node scripts/build-2026-09-08-single-scoop-picks-report.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function cites(items) {
  return `<ul class="cites">\n${items.map((i) => `<li>${i}</li>`).join("\n")}\n</ul>`;
}

/** @type {Record<number, { pages: number; pickDescription: string; whyIncluded: string }>} */
const ENRICH = {
  332: {
    pages: 87,
    pickDescription:
      "Santiago, an Andalusian shepherd, follows an omen toward treasure and a Personal Legend. Short, parable-like, and very easy to finish (Kindle print length 87 on this HarperCollins listing).",
    whyIncluded: cites([
      "<strong>Wishlist title:</strong> On your Audible wish list.",
      "<strong>Length:</strong> Shortest match in this crawl (Amazon Kindle print length <strong>87 pages</strong>; typical paperbacks run closer to 160–200).",
      'Overview: <a href="https://en.wikipedia.org/wiki/The_Alchemist_(novel)">Wikipedia: <em>The Alchemist</em></a> (1988).',
    ]),
  },
  1540: {
    pages: 106,
    pickDescription:
      "Cathy and Heathcliff’s obsessive love on the Yorkshire moors — revenge, class, and weather as character. Pre-1960 classic. This De Marque Kindle listing is only 106 pages; a Penguin/Oxford edition of the same novel is usually much longer, so treat the page count as this file, not the standard text length.",
    whyIncluded: cites([
      "<strong>Pre-1960 original:</strong> First published <strong>1847</strong> — <a href=\"https://en.wikipedia.org/wiki/Wuthering_Heights\">Wikipedia: <em>Wuthering Heights</em></a>.",
      '<strong>Canon:</strong> <a href="https://www.britannica.com/topic/Wuthering-Heights-novel">Britannica: <em>Wuthering Heights</em></a>.',
      "<strong>Interest list:</strong> On your Kindle modern-classic / greatest-books lane.",
    ]),
  },
  2187: {
    pages: 130,
    pickDescription:
      "Esther Greenwood’s New York magazine summer and the breakdown that follows. Sharp, funny, and devastating — a short modern classic in this HarperCollins Kindle edition (130 pages).",
    whyIncluded: cites([
      "<strong>Interest / modern classic:</strong> On your Kindle interest-title list.",
      'First published <strong>1963</strong> — <a href="https://en.wikipedia.org/wiki/The_Bell_Jar">Wikipedia: <em>The Bell Jar</em></a>; <a href="https://www.britannica.com/topic/The-Bell-Jar">Britannica</a>.',
    ]),
  },
  435: {
    pages: 188,
    pickDescription:
      "Frankl’s account of surviving the camps, then the argument of logotherapy: meaning as a reason to live. Short, canonical nonfiction (Kindle 188 pages).",
    whyIncluded: cites([
      "<strong>Interest list:</strong> Named in your Kindle preferences (nonfiction you want when present).",
      'First published <strong>1946</strong> (German) — <a href="https://en.wikipedia.org/wiki/Man%27s_Search_for_Meaning">Wikipedia: <em>Man’s Search for Meaning</em></a>.',
      '<a href="https://www.britannica.com/topic/Mans-Search-for-Meaning">Britannica: <em>Man’s Search for Meaning</em></a>.',
    ]),
  },
  2147: {
    pages: 188,
    pickDescription:
      "A short, furious essay-memoir about Gaza, Western media, and what it means to watch a slaughter in real time. Not a novel; National Book Award winner (Kindle 188 pages).",
    whyIncluded: cites([
      "<strong>Wishlist title + author:</strong> On your Audible wish list (Omar El Akkad).",
      'Award: National Book Award — see <a href="https://en.wikipedia.org/wiki/One_Day,_Everyone_Will_Have_Always_Been_Against_This">Wikipedia</a>.',
    ]),
  },
  2025: {
    pages: 189,
    pickDescription:
      "Schoolboys stranded on an island invent a society, then tear it apart. Tight, brutal, and still the shortest way to read a famous 20th-century novel (Kindle 189 pages).",
    whyIncluded: cites([
      "<strong>Pre-1960 original:</strong> First published <strong>1954</strong> — <a href=\"https://en.wikipedia.org/wiki/Lord_of_the_Flies\">Wikipedia: <em>Lord of the Flies</em></a>.",
      '<strong>Canon:</strong> <a href="https://www.britannica.com/topic/Lord-of-the-Flies-novel-by-Golding">Britannica: <em>Lord of the Flies</em></a>.',
      "<strong>Interest list:</strong> On your Kindle greatest-books lane.",
    ]),
  },
  2716: {
    pages: 208,
    pickDescription:
      "Arthur Dent is rescued from Earth’s demolition and given a towel. This is the illustrated edition of book 1 — still a short, funny SF classic (Kindle 208 pages).",
    whyIncluded: cites([
      "<strong>Wishlist title + author:</strong> On your Audible wish list and interest list (Douglas Adams).",
      '<a href="https://en.wikipedia.org/wiki/The_Hitchhiker%27s_Guide_to_the_Galaxy">Wikipedia: <em>The Hitchhiker’s Guide to the Galaxy</em></a> (1979).',
    ]),
  },
  3042: {
    pages: 210,
    pickDescription:
      "Ged, a gifted boy on Gont, overreaches, names a shadow, and has to hunt it across the Archipelago. The right Le Guin starting point if you want SFF that’s actually renowned — and it’s short (Kindle 210 pages).",
    whyIncluded: cites([
      "<strong>Canon author (all works):</strong> Ursula K. Le Guin is on your include-every-work list (Audible wish list).",
      'First published <strong>1968</strong> — <a href="https://en.wikipedia.org/wiki/A_Wizard_of_Earthsea">Wikipedia: <em>A Wizard of Earthsea</em></a>.',
      '<a href="https://www.britannica.com/topic/A-Wizard-of-Earthsea">Britannica: <em>A Wizard of Earthsea</em></a>.',
    ]),
  },
  2828: {
    pages: 213,
    pickDescription:
      "Stormlight novella set on Aimia: Rysn, a crew, and a secret the world isn’t supposed to have. Shorter than a mainline Sanderson brick, but it assumes you’ve read *Oathbringer* (Kindle 213 pages).",
    whyIncluded: cites([
      "<strong>Wishlist author:</strong> Brandon Sanderson is on your Amazon wish list (Mistborn / Stormlight).",
      'Work notes: <a href="https://coppermind.net/wiki/Dawnshard_(novella)">Coppermind: <em>Dawnshard</em></a>.',
    ]),
  },
  1047: {
    pages: 222,
    pickDescription:
      "A sportswriter visits his dying former professor every Tuesday. Plainspoken memoir about a last class in how to live (Kindle 222 pages).",
    whyIncluded: cites([
      "<strong>Wishlist title + author:</strong> On your Amazon wish list (Mitch Albom).",
      '<a href="https://en.wikipedia.org/wiki/Tuesdays_with_Morrie">Wikipedia: <em>Tuesdays with Morrie</em></a> (1997).',
    ]),
  },
  1019: {
    pages: 231,
    pickDescription:
      "Billy Pilgrim becomes “unstuck in time” around the Dresden firebombing — war, aliens, and “so it goes.” Random House edition of Vonnegut’s most famous novel (Kindle 231 pages).",
    whyIncluded: cites([
      "<strong>Canon author (all works):</strong> Kurt Vonnegut; also on your interest list.",
      '<a href="https://www.britannica.com/topic/Slaughterhouse-Five">Britannica: <em>Slaughterhouse-Five</em></a>; <a href="https://en.wikipedia.org/wiki/Slaughterhouse-Five">Wikipedia</a> (1969).',
    ]),
  },
  2321: {
    pages: 240,
    pickDescription:
      "Marcus Aurelius’s notes to himself, in Gregory Hays’s Modern Library translation (Ryan Holiday intro on this listing). This is the translation you specifically flagged (Kindle 240 pages).",
    whyIncluded: cites([
      "<strong>Interest list:</strong> *Meditations*, Hays translation.",
      'Ancient text (pre-1960 by many centuries) — <a href="https://en.wikipedia.org/wiki/Meditations">Wikipedia: <em>Meditations</em></a>.',
      '<a href="https://www.britannica.com/topic/Meditations-by-Marcus-Aurelius">Britannica: <em>Meditations</em></a>.',
    ]),
  },
  2465: {
    pages: 241,
    pickDescription:
      "Didion’s year after her husband’s sudden death — grief as a writer’s problem, not a slogan. Short National Book Award winner (Kindle 241 pages).",
    whyIncluded: cites([
      "<strong>Canon author (all works):</strong> Joan Didion; *The Year of Magical Thinking* is also on your interest appendix.",
      'National Book Award — <a href="https://en.wikipedia.org/wiki/The_Year_of_Magical_Thinking">Wikipedia</a> (2005).',
    ]),
  },
  299: {
    pages: 249,
    pickDescription:
      "A man lives in an infinite house of halls, statues, and tides, writing reports for someone who may not exist. Puzzle-box fantasy with a very Clarke voice (Kindle 249 pages).",
    whyIncluded: cites([
      "<strong>Wishlist title + author:</strong> On your Audible wish list (Susanna Clarke).",
      '<a href="https://en.wikipedia.org/wiki/Piranesi_(novel)">Wikipedia: <em>Piranesi</em></a> (2020).',
    ]),
  },
  947: {
    pages: 258,
    pickDescription:
      "Stevens, an English butler, reviews a lifetime of professional poise and private failure on a motoring holiday. Quiet, devastating, Nobel-adjacent modern classic (Kindle 258 pages).",
    whyIncluded: cites([
      "<strong>Wishlist title + author:</strong> On your Audible wish list (Kazuo Ishiguro).",
      'Booker Prize — <a href="https://en.wikipedia.org/wiki/The_Remains_of_the_Day">Wikipedia: <em>The Remains of the Day</em></a> (1989).',
      '<a href="https://www.britannica.com/topic/The-Remains-of-the-Day">Britannica</a>.',
    ]),
  },
  2758: {
    pages: 260,
    pickDescription:
      "Wilbur the pig, Charlotte the spider, and a barnyard that takes friendship seriously. Children’s classic that still reads as a complete novel (Kindle 260 pages on this illustrated listing).",
    whyIncluded: cites([
      "<strong>Wishlist author:</strong> E. B. White is on your Audible wish list (*Stuart Little*).",
      'Newbery Honor, 1952 — <a href="https://en.wikipedia.org/wiki/Charlotte%27s_Web">Wikipedia: <em>Charlotte’s Web</em></a>.',
    ]),
  },
  356: {
    pages: 267,
    pickDescription:
      "An agency fights ideas that erase themselves from memory. High-concept SCP-adjacent SF thriller — on your wish list, and a genuine one-sitting read (Kindle 267 pages).",
    whyIncluded: cites([
      "<strong>Wishlist title + author:</strong> On your Audible wish list (qntm).",
      '<a href="https://en.wikipedia.org/wiki/There_Is_No_Antimemetics_Division">Wikipedia: <em>There Is No Antimemetics Division</em></a>.',
    ]),
  },
  789: {
    pages: 268,
    pickDescription:
      "Case, a washed-up console cowboy, is hired for one last run through cyberspace. The cyberpunk starter that actually belongs on “renowned SFF” lists (Kindle 268 pages).",
    whyIncluded: cites([
      "<strong>Interest / SFF canon:</strong> On your Kindle interest-title list.",
      'Nebula/Hugo/Philip K. Dick — <a href="https://en.wikipedia.org/wiki/Neuromancer">Wikipedia: <em>Neuromancer</em></a> (1984).',
    ]),
  },
  1497: {
    pages: 271,
    pickDescription:
      "Holden Caulfield after getting kicked out of Pencey — phonies, museums, and a weekend in New York. Famous, short, and on your core classics list (Kindle 271 pages).",
    whyIncluded: cites([
      "<strong>Interest list:</strong> *The Catcher in the Rye* is on your core classics list.",
      'First published <strong>1951</strong> — <a href="https://en.wikipedia.org/wiki/The_Catcher_in_the_Rye">Wikipedia</a>; <a href="https://www.britannica.com/topic/The-Catcher-in-the-Rye">Britannica</a>.',
    ]),
  },
  1216: {
    pages: 272,
    pickDescription:
      "Guy Montag burns books until a neighbor and a hidden volume crack his certainty. Official Simon & Schuster Kindle of the 1953 dystopia (this listing is 272 pages — extras/intro make it longer than some paperbacks).",
    whyIncluded: cites([
      "<strong>Wishlist title:</strong> On your Audible wish list.",
      '<strong>Pre-1960 original:</strong> 1953 — <a href="https://en.wikipedia.org/wiki/Fahrenheit_451">Wikipedia: <em>Fahrenheit 451</em></a>; <a href="https://www.britannica.com/topic/Fahrenheit-451-novel">Britannica</a>.',
    ]),
  },
  1090: {
    pages: 272,
    pickDescription:
      "Kathy, Ruth, and Tommy grow up in an English boarding school that isn’t what it pretends to be. Ishiguro’s quiet SF tragedy — include because you want all Ishiguro when present (Kindle 272 pages).",
    whyIncluded: cites([
      "<strong>Wishlist author (all works):</strong> Kazuo Ishiguro (*Klara and the Sun*, *The Remains of the Day*).",
      'Booker shortlist — <a href="https://en.wikipedia.org/wiki/Never_Let_Me_Go_(novel)">Wikipedia: <em>Never Let Me Go</em></a> (2005).',
    ]),
  },
  1601: {
    pages: 272,
    pickDescription:
      "Ten strangers invited to an island, a nursery rhyme, and a murderer who may already be in the house. Christie’s most famous setup, still a brisk mystery (Kindle 272 pages).",
    whyIncluded: cites([
      "<strong>Wishlist title + author:</strong> On your Audible wish list (Agatha Christie).",
      '<strong>Pre-1960 original:</strong> 1939 — <a href="https://en.wikipedia.org/wiki/And_Then_There_Were_None">Wikipedia: <em>And Then There Were None</em></a>.',
    ]),
  },
  1080: {
    pages: 278,
    pickDescription:
      "Marianne and Connell in small-town Ireland, then Dublin — class, sex, and the gap between how people talk and what they mean. Wishlist novel, not the shortest (Kindle 278 pages).",
    whyIncluded: cites([
      "<strong>Wishlist title + author:</strong> On your Audible wish list (Sally Rooney).",
      '<a href="https://en.wikipedia.org/wiki/Normal_People">Wikipedia: <em>Normal People</em></a> (2018).',
    ]),
  },
  2240: {
    pages: 288,
    pickDescription:
      "Roland Deschain hunts the Man in Black across a dying world. Book 1 of The Dark Tower — on your Audible wish list, and the shortest door into that series (Kindle 288 pages).",
    whyIncluded: cites([
      "<strong>Wishlist title:</strong> *The Dark Tower I: The Gunslinger* is on your Audible wish list (Stephen King).",
      '<a href="https://en.wikipedia.org/wiki/The_Gunslinger">Wikipedia: <em>The Gunslinger</em></a> (1982).',
    ]),
  },
  2: {
    pages: 291,
    pickDescription:
      "Sybil Van Antwerp writes letters for decades — tart, generous, and more revealing than she means them to be. Epistolary novel high on the Featured list (Kindle 291 pages).",
    whyIncluded: cites([
      "<strong>Wishlist title + author:</strong> On your Audible wish list (Virginia Evans).",
    ]),
  },
  1654: {
    pages: 296,
    pickDescription:
      "Klara, an Artificial Friend in a shop window, watches the sun and waits to be chosen. Ishiguro’s late SF fable — wishlist title (Kindle 296 pages).",
    whyIncluded: cites([
      "<strong>Wishlist title + author:</strong> On your Audible wish list (Kazuo Ishiguro).",
      '<a href="https://en.wikipedia.org/wiki/Klara_and_the_Sun">Wikipedia: <em>Klara and the Sun</em></a> (2021).',
    ]),
  },
  1961: {
    pages: 297,
    pickDescription:
      "Bilbo leaves Bag End, meets dwarves, a dragon, and a ring. The shortest Tolkien that still feels like Tolkien (Kindle 297 pages on this listing).",
    whyIncluded: cites([
      "<strong>Interest title + wishlist author:</strong> *The Hobbit* / J. R. R. Tolkien.",
      '<strong>Pre-1960 original:</strong> 1937 — <a href="https://en.wikipedia.org/wiki/The_Hobbit">Wikipedia: <em>The Hobbit</em></a>.',
    ]),
  },
  145: {
    pages: 299,
    pickDescription:
      "Nora Seed finds a library between life and death where every unread life is a book. Easy, high-wishlist contemporary novel (Kindle 299 pages).",
    whyIncluded: cites([
      "<strong>Wishlist title + author:</strong> On your Audible wish list (Matt Haig).",
      '<a href="https://en.wikipedia.org/wiki/The_Midnight_Library">Wikipedia: <em>The Midnight Library</em></a> (2020).',
    ]),
  },
};

const PICK_ORDER = Object.entries(ENRICH)
  .sort((a, b) => a[1].pages - b[1].pages || Number(a[0]) - Number(b[0]))
  .map(([n]) => Number(n));

const SRC_JSON = path.join(root, "out/results-2026-09-08T11-08-46.json");
const OUT_HTML = path.join(
  root,
  "out/report-2026-09-08T11-08-46-single-scoop-picks.html",
);
const OUT_JSON = path.join(
  root,
  "out/picks-2026-09-08T11-08-46-single-scoop.json",
);

const payload = JSON.parse(fs.readFileSync(SRC_JSON, "utf8"));
const want = new Set(PICK_ORDER);
const byNum = new Map(
  payload.results.filter((r) => want.has(r.itemNumber)).map((r) => [r.itemNumber, r]),
);

const missing = PICK_ORDER.filter((n) => !byNum.has(n));
if (missing.length) {
  console.error("Missing itemNumbers in source:", missing);
  process.exit(1);
}

function amazonUrl(href) {
  if (!href) return "";
  return href.startsWith("http") ? href : "https://www.amazon.com" + href;
}

const enrichedResults = PICK_ORDER.map((n) => {
  const row = { ...byNum.get(n) };
  const extra = ENRICH[n];
  const asin = String(row.href || "").match(/\/dp\/([A-Z0-9]{10})/)?.[1];
  return {
    itemNumber: row.itemNumber,
    pages: extra.pages,
    title: row.title,
    author: String(row.author || "").replace(/\s+/g, " ").trim(),
    pickDescription: extra.pickDescription,
    whyIncluded: extra.whyIncluded,
    cover: row.cover,
    href: asin ? `https://www.amazon.com/dp/${asin}` : amazonUrl(row.href),
    _meta: row._meta,
  };
});

const outPayload = {
  meta: {
    ...payload.meta,
    count: enrichedResults.length,
    subtitle: "Kindle Single Scoop (Featured) — curated picks, shortest first",
    sourceReport: "report-2026-09-08T11-08-46.html",
    sourceCount: payload.meta.count,
    pickItemNumbers: PICK_ORDER,
    lengthNote:
      "pages = Amazon Kindle print length for this listing. Sorted shortest first.",
    sort: "featured-rank",
  },
  results: enrichedResults,
};

fs.writeFileSync(OUT_JSON, JSON.stringify(outPayload, null, 2));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kindle Single Scoop — curated picks (Featured)</title>
  <link rel="stylesheet" href="https://unpkg.com/tabulator-tables@6.3.1/dist/css/tabulator.min.css" />
  <style>
    body { font-family: system-ui, sans-serif; margin: 1rem; }
    .meta { color: #444; margin-bottom: 1rem; }
    #grid { margin-top: 0.5rem; }
    .tabulator .tabulator-header-filter input { font-size: 12px; }
    .tabulator .tabulator-row { min-height: 200px; }
    .tabulator .tabulator-cell {
      height: 200px;
      vertical-align: top;
      white-space: normal;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .tabulator .cell-image {
      display: flex;
      align-items: stretch;
      height: 200px;
      width: 100%;
    }
    .tabulator .cell-image img {
      height: 200px;
      width: 100%;
      object-fit: contain;
      display: block;
    }
    .tabulator .tabulator-cell ul.cites {
      margin: 0;
      padding-left: 1.1rem;
      font-size: 12px;
      line-height: 1.4;
    }
    .tabulator .tabulator-cell ul.cites li { margin-bottom: 0.35rem; }
  </style>
</head>
<body>
  <h1>Kindle Single Scoop — curated picks (Featured)</h1>
  <p class="meta">
    Sorted by Kindle print length (shorter first) ·
    Count: ${outPayload.meta.count} ·
    From ${outPayload.meta.sourceCount} crawled titles (200 Featured pages) ·
    Source: <code>${outPayload.meta.sourceReport}</code> ·
    Generated: ${new Date().toISOString()}
  </p>
  <p class="meta" style="font-size: 13px;">
    Preference matches after dropping Pride and Prejudice variations and other title collisions.
    <strong>pages</strong> is Amazon’s Kindle print length for this listing.
  </p>
  <p class="meta" id="unpaginate-review-toolbar" style="font-size: 13px;">
    <strong>Review:</strong>
    check <strong>Hide</strong> on a row to remove it from the table (session only; refresh restores everything).
    <button type="button" id="unpaginate-show-all-rows" style="margin-left: 0.5rem;">Show all hidden rows</button>
    <span id="unpaginate-hidden-count-wrap" style="margin-left: 0.35rem;">(<span id="unpaginate-hidden-count">0</span> hidden)</span>
  </p>
  <div id="grid"></div>
  <script type="application/json" id="unpaginate-data">${JSON.stringify(outPayload)}</script>
  <script src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
  <script>
(function () {
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function formatDescriptionHtml(s) {
    if (s == null) return "";
    var parts = String(s).split(/(\\*[^*]+\\*)/g);
    var out = "";
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (/^\\*[^*]+\\*$/.test(p)) {
        out += "<em>" + esc(p.slice(1, -1)) + "</em>";
      } else {
        out += esc(p);
      }
    }
    return out;
  }
  var payload = JSON.parse(document.getElementById("unpaginate-data").textContent);
  var hiddenRowUids = new Set();
  function updateHiddenCount() {
    var el = document.getElementById("unpaginate-hidden-count");
    if (el) el.textContent = String(hiddenRowUids.size);
  }
  var rows = payload.results.map(function (r, i) {
    return Object.assign({ __rowUid: i }, r);
  });
  var hideColumn = {
    title: "Hide",
    field: "__hideUi",
    width: 72,
    headerSort: false,
    headerFilter: false,
    formatter: function (cell) {
      var wrap = document.createElement("div");
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.addEventListener("change", function () {
        var uid = cell.getRow().getData().__rowUid;
        if (cb.checked) hiddenRowUids.add(uid); else hiddenRowUids.delete(uid);
        table.refreshFilter();
        updateHiddenCount();
      });
      wrap.appendChild(cb);
      return wrap;
    }
  };
  var table = new Tabulator("#grid", {
    data: rows,
    layout: "fitColumns",
    rowHeight: 200,
    pagination: false,
    movableColumns: true,
    initialSort: [{ column: "pages", dir: "asc" }],
    columns: [
      hideColumn,
      { field: "itemNumber", title: "#", width: 60 },
      { field: "pages", title: "pages", width: 80, headerFilter: "input" },
      { field: "title", title: "title", headerFilter: "input", widthGrow: 2 },
      { field: "author", title: "author", headerFilter: "input", widthGrow: 2 },
      { field: "pickDescription", title: "pickDescription", headerFilter: "input", widthGrow: 3, formatter: function (c) {
        return formatDescriptionHtml(c.getValue());
      }},
      { field: "whyIncluded", title: "whyIncluded", headerFilter: "input", widthGrow: 3, formatter: function (c) {
        return c.getValue() || "";
      }},
      { field: "cover", title: "cover", width: 90, formatter: function (c) {
        var v = c.getValue();
        return v ? '<div class="cell-image"><img src="'+esc(v)+'" alt=""/></div>' : "";
      }},
      { field: "href", title: "link", width: 80, formatter: function (c) {
        var v = c.getValue();
        return v ? '<a href="'+esc(v)+'" target="_blank" rel="noopener">Amazon</a>' : "";
      }}
    ]
  });
  table.setFilter(function (data) {
    return !hiddenRowUids.has(data.__rowUid);
  });
  updateHiddenCount();
  document.getElementById("unpaginate-show-all-rows").addEventListener("click", function () {
    hiddenRowUids.clear();
    table.refreshFilter();
    updateHiddenCount();
  });
})();
  </script>
</body>
</html>
`;

fs.writeFileSync(OUT_HTML, html, "utf8");
console.log("Wrote", OUT_JSON);
console.log("Wrote", OUT_HTML);
for (const r of enrichedResults) {
  console.log(`  ${String(r.pages).padStart(3)}p  #${r.itemNumber}  ${r.title}`);
}
