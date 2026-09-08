/**
 * One-off generator: classic-picks report from unpaginate results JSON.
 * Run: node scripts/build-classic-picks-report.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const PICK_ORDER = [
  8, 25, 40, 70, 126, 162, 245, 330, 340, 378, 412,
];

/** @type {Record<number, { pickDescription: string; whyIncluded: string }>} */
const ENRICH = {
  8: {
    pickDescription:
      "Accessible prose retelling of Homer’s *Odyssey*: Odysseus’s long voyage home after the Trojan War. Stephen Fry reads his own adaptation—good entry to the Greek epic without tackling a scholarly translation.",
    whyIncluded: `<ul class="cites">
<li><strong>Canon / “greatest works”:</strong> Homer’s <em>Odyssey</em> is standard curriculum and anthology material; see <a href="https://www.britannica.com/topic/Odyssey-epic-poem">Britannica: <em>Odyssey</em></a>.</li>
<li><strong>List footprint:</strong> Often appears on aggregated rankings (e.g. <a href="https://thegreatestbooks.org/">The Greatest Books</a> includes Homer).</li>
<li><strong>Note:</strong> This audiobook is Fry’s retelling, not a literal translation; the underlying poem is ancient (well before 1960).</li>
</ul>`,
  },
  25: {
    pickDescription:
      "Southern family saga: Tom Wingo tells his sister’s psychiatrist the violent, tangled history of his South Carolina childhood. Lush, emotional American literary fiction (not pre-1960, but a major mainstream “serious novel”).",
    whyIncluded: `<ul class="cites">
<li><strong>Standing:</strong> Pat Conroy’s breakthrough bestseller, widely discussed as a defining late-20th-century Southern novel—see overview at <a href="https://en.wikipedia.org/wiki/The_Prince_of_Tides_(novel)">Wikipedia: <em>The Prince of Tides</em></a>.</li>
<li><strong>Criterion:</strong> Fits “modern classic / respected American novel” more than a single “top 100” slot; included for literary-fiction overlap with your taste, not pre-1960 publication.</li>
</ul>`,
  },
  40: {
    pickDescription:
      "Huge, virtuosic tragicomedy set around a tennis academy and a rehab ward in a near-future America—addiction, entertainment, irony, and empathy at maximal scale. The 30th-anniversary edition adds a new intro (Michelle Zauner).",
    whyIncluded: `<ul class="cites">
<li><strong>Major list:</strong> <em>TIME</em>’s “All-<em>TIME</em> 100 Novels” includes it—<a href="https://entertainment.time.com/2005/10/16/all-time-100-novels/slide/infinite-jest-1996-by-david-foster-wallace/"><em>Infinite Jest</em> on TIME’s list</a>.</li>
<li><strong>Reference:</strong> <a href="https://en.wikipedia.org/wiki/Infinite_Jest">Wikipedia: <em>Infinite Jest</em></a> (1996).</li>
</ul>`,
  },
  70: {
    pickDescription:
      "Multi-generational epic of a Korean family in Japan from the colonial period onward—discrimination, exile, dignity, and stubborn survival. Historical literary fiction with family-saga sweep.",
    whyIncluded: `<ul class="cites">
<li><strong>Award / list gravity:</strong> National Book Award fiction finalist—<a href="https://www.nationalbook.org/books/pachinko/">National Book Foundation: <em>Pachinko</em></a>.</li>
<li><strong>Reference:</strong> <a href="https://en.wikipedia.org/wiki/Pachinko_(novel)">Wikipedia: <em>Pachinko</em></a> (2017).</li>
</ul>`,
  },
  126: {
    pickDescription:
      "First book of Butler’s Xenogenesis trilogy: Lilith awakens on an alien ship after human catastrophe; the Oankali offer survival at a radical genetic price. Science fiction with moral weight and literary reputation.",
    whyIncluded: `<ul class="cites">
<li><strong>Author canon:</strong> Octavia E. Butler is widely taught and anthologized as a major American writer; MacArthur fellow—<a href="https://en.wikipedia.org/wiki/Octavia_E._Butler">Wikipedia: Octavia E. Butler</a>.</li>
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Dawn_(Butler_novel)">Wikipedia: <em>Dawn</em></a> (1987).</li>
</ul>`,
  },
  162: {
    pickDescription:
      "Anthology of Korean myths and traditional tales drawn from classic collections (Griffis, Im Bang, Yi Ryuk, Allen, etc.). Strong fit if you want non-Western myth beside Greek epics.",
    whyIncluded: `<ul class="cites">
<li><strong>Criterion:</strong> Not one “first edition” year—stories are premodern folklore; the English compilations are early-to-mid 20th century. Included as <strong>nonfiction/mythology</strong> overlap with world classics.</li>
<li><strong>Context:</strong> See background on Griffis’s Korean fairy-tale collections (early English mediation)—<a href="https://en.wikipedia.org/wiki/William_Elliot_Griffis">Wikipedia: William Elliot Griffis</a>.</li>
</ul>`,
  },
  245: {
    pickDescription:
      "The first James Bond novel: high-stakes chemin-de-fer in France, Cold War polish, and the template for the franchise. Spy genre cornerstone.",
    whyIncluded: `<ul class="cites">
<li><strong>Pre-1960 original:</strong> First published <strong>1953</strong>—<a href="https://en.wikipedia.org/wiki/Casino_Royale_(novel)">Wikipedia: <em>Casino Royale</em></a>.</li>
<li><strong>Canon:</strong> Culturally central twentieth-century popular novel; not typically a “modernistTop100” literary saint, but undisputedly famous.</li>
</ul>`,
  },
  330: {
    pickDescription:
      "Tibetan Buddhist guide to dying and the between-states (bardo), in a widely used English edition with Dalai Lama framing and editorial apparatus—spiritual nonfiction, not a novel.",
    whyIncluded: `<ul class="cites">
<li><strong>Religious / textual classic:</strong> <a href="https://www.britannica.com/topic/Bardo-Thodol">Britannica: <em>Bardo Thödol</em> (Tibetan Book of the Dead)</a>.</li>
<li><strong>Criterion:</strong> Underlying tradition is ancient/medieval; this audiobook is a modern compilation/translation, analogous to listening to a bible or sutra edition.</li>
</ul>`,
  },
  340: {
    pickDescription:
      "Western: Civil War–era Texas gunfighter lore, quick-on-the-draw reputation, frontier justice. Pure Louis L’Amour formula—but brisk and historically flavored.",
    whyIncluded: `<ul class="cites">
<li><strong>Pre-1960 original:</strong> Novel first published <strong>1959</strong>—see publishing notes at <a href="https://www.penguinrandomhouse.com/books/96754/the-first-fast-draw-by-louis-lamour/">Penguin Random House: <em>The First Fast Draw</em></a>.</li>
<li><strong>Criterion:</strong> Genre giant author + meets your pre-1960 cutoff for the underlying book (not the audiobook date).</li>
</ul>`,
  },
  378: {
    pickDescription:
      "American expatriate in Paris wrestles with desire, shame, and identity in the 1950s—an intimate tragedy and a landmark in Baldwin’s early fiction. Novella length, devastating voice.",
    whyIncluded: `<ul class="cites">
<li><strong>Modern classic / author canon:</strong> James Baldwin is foundational American literature—<a href="https://en.wikipedia.org/wiki/James_Baldwin">Wikipedia: James Baldwin</a>.</li>
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Giovanni%27s_Room">Wikipedia: <em>Giovanni’s Room</em></a> (1956; pre-1960).</li>
<li><strong>List / survey context:</strong> Frequently named in LGBTQ+ literature curricula and “essential novels” anthologies (various outlets; see Wikipedia’s reception section for pointers).</li>
</ul>`,
  },
  412: {
    pickDescription:
      "The super-strong, recklessly honest girl who lives alone with a horse and a monkey—chaotic kindness and children’s anarchy from Sweden’s best-loved storyteller. Short listen with cross-generational charm.",
    whyIncluded: `<ul class="cites">
<li><strong>Pre-1960 original:</strong> Swedish publication <strong>1945</strong> (<em>Pippi Långstrump</em>)—<a href="https://en.wikipedia.org/wiki/Pippi_Longstocking_(novel)">Wikipedia: <em>Pippi Longstocking</em> (novel)</a>.</li>
<li><strong>Author:</strong> Astrid Lindgren is internationally canonical for children’s literature—<a href="https://en.wikipedia.org/wiki/Astrid_Lindgren">Wikipedia: Astrid Lindgren</a>.</li>
</ul>`,
  },
};

const SRC_JSON = path.join(root, "out/results-2026-03-24T18-25-51.json");
const OUT_HTML = path.join(
  root,
  "out/report-2026-03-24-18-25-51-classic-picks.html",
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

const enrichedResults = PICK_ORDER.map((n) => {
  const row = { ...byNum.get(n) };
  const extra = ENRICH[n];
  if (!extra) {
    throw new Error(`No ENRICH for ${n}`);
  }
  row.pickDescription = extra.pickDescription;
  row.whyIncluded = extra.whyIncluded;
  return row;
});

const outPayload = {
  meta: {
    ...payload.meta,
    count: enrichedResults.length,
    subtitle: "Classic / canon picks only (curated from parent crawl)",
    sourceReport: "report-2026-03-24-18-25-51.html",
    pickItemNumbers: PICK_ORDER,
  },
  results: enrichedResults,
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Unpaginate report — classic picks</title>
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
    .tabulator .tabulator-cell .tabulator-cell-value { white-space: normal; }
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
  <h1>Unpaginate report — classic picks</h1>
  <p class="meta">
    Filtered from parent crawl ·
    Count: ${outPayload.meta.count} ·
    Source: <code>${outPayload.meta.sourceReport}</code> ·
    Generated: ${new Date().toISOString()}
  </p>
  <p class="meta" style="font-size: 13px;">
    Sort by clicking headers. Filter with inputs under headers.
    Columns <strong>pickDescription</strong> and <strong>whyIncluded</strong> were added for this view.
    Drag column headers to reorder.
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
  function isImgCell(col, v) {
    if (typeof v !== "string" || !/^https?:\\/\\//i.test(v.trim())) return false;
    var u;
    try { u = new URL(v.trim()); } catch (e) { return false; }
    var c = col.toLowerCase();
    if (
      c === "cover" ||
      c === "poster" ||
      c === "thumbnail" ||
      c.endsWith("image") ||
      c.endsWith("thumbnail") ||
      c.endsWith("imageurl") ||
      c.endsWith("coverurl")
    ) {
      return true;
    }
    if (/\\.(jpe?g|png|gif|webp|avif)$/i.test(u.pathname.split("/").pop() || "")) return true;
    if (/m\\.media-amazon|images-amazon|ssl-images-amazon/i.test(u.hostname)) return true;
    return false;
  }
  function flattenRow(r, i) {
    var o = {
      itemNumber: typeof r.itemNumber === "number" ? r.itemNumber : i + 1,
      pickDescription: r.pickDescription,
      whyIncluded: r.whyIncluded,
      pageIndex: r._meta && r._meta.pageIndex,
      pageUrl: r._meta && r._meta.pageUrl
    };
    for (var k in r) {
      if (k === "_meta" || k === "itemNumber") continue;
      if (k === "pickDescription" || k === "whyIncluded") continue;
      o[k] = r[k];
    }
    return o;
  }
  function allColumnKeys(tableRows) {
    var seen = {};
    var keys = [];
    function add(k) {
      if (!seen[k]) {
        seen[k] = true;
        keys.push(k);
      }
    }
    add("itemNumber");
    add("pickDescription");
    add("whyIncluded");
    add("pageIndex");
    add("pageUrl");
    for (var i = 0; i < tableRows.length; i++) {
      var row = tableRows[i];
      for (var k in row) {
        if (k === "__rowUid") continue;
        if (
          k !== "itemNumber" &&
          k !== "pickDescription" &&
          k !== "whyIncluded" &&
          k !== "pageIndex" &&
          k !== "pageUrl"
        ) {
          add(k);
        }
      }
    }
    return keys;
  }
  /** Italics from *segments* in description (no raw HTML in pickDescription). */
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
  function cellFormatter(cell) {
    var v = cell.getValue();
    var col = cell.getField();
    if (v === null || v === undefined) return "";
    if (col === "whyIncluded" && typeof v === "string") {
      return v;
    }
    if (col === "pickDescription" && typeof v === "string") {
      return formatDescriptionHtml(v);
    }
    if (typeof v === "object") return esc(JSON.stringify(v));
    var s = String(v);
    if (isImgCell(col, s)) {
      return '<div class="cell-image"><img src="' + esc(s) + '" alt="" loading="lazy" decoding="async" /></div>';
    }
    return esc(s);
  }
  var payload = JSON.parse(document.getElementById("unpaginate-data").textContent);
  var rows = payload.results.map(flattenRow);
  for (var ri = 0; ri < rows.length; ri++) {
    rows[ri].__rowUid = ri;
  }
  var hiddenRowUids = new Set();
  function updateHiddenCount() {
    var el = document.getElementById("unpaginate-hidden-count");
    if (el) el.textContent = String(hiddenRowUids.size);
  }
  var keys = allColumnKeys(rows);
  var columns = keys.map(function (field) {
    var def = {
      field: field,
      title: field,
      headerFilter: "input",
      headerFilterPlaceholder: "Filter…",
      formatter: cellFormatter
    };
    if (field === "pickDescription") {
      def.widthGrow = 2;
      def.minWidth = 280;
    }
    if (field === "whyIncluded") {
      def.widthGrow = 3;
      def.minWidth = 320;
    }
    return def;
  });
  var hideColumn = {
    title: "Hide",
    field: "__hideUi",
    width: 72,
    minWidth: 72,
    hozAlign: "center",
    vertAlign: "middle",
    headerSort: false,
    headerFilter: false,
    resizable: false,
    formatter: function (cell) {
      var wrap = document.createElement("div");
      wrap.style.paddingTop = "6px";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.title = "Hide this row (until you click Show all hidden rows or refresh the page)";
      cb.addEventListener("click", function (e) {
        e.stopPropagation();
      });
      cb.addEventListener("change", function () {
        var data = cell.getRow().getData();
        var uid = data.__rowUid;
        if (cb.checked) {
          hiddenRowUids.add(uid);
        } else {
          hiddenRowUids.delete(uid);
        }
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
    columns: [hideColumn].concat(columns)
  });
  table.setFilter(function (data) {
    return !hiddenRowUids.has(data.__rowUid);
  });
  updateHiddenCount();
  var showAllBtn = document.getElementById("unpaginate-show-all-rows");
  if (showAllBtn) {
    showAllBtn.addEventListener("click", function () {
      hiddenRowUids.clear();
      table.refreshFilter();
      updateHiddenCount();
    });
  }
})();
  </script>
</body>
</html>
`;

fs.writeFileSync(OUT_HTML, html, "utf8");
console.log("Wrote", OUT_HTML);
