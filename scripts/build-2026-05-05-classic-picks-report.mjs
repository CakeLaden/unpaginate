/**
 * One-off generator: 2026-05-05 classic-ish picks report from unpaginate results JSON.
 * Run: node scripts/build-2026-05-05-classic-picks-report.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

// “Err on inclusion”: classics + modern classics + well-regarded SFF + major thinkers.
const PICK_ORDER = [
  11, 24, 40, 47, 68, 89, 108, 113, 134, 151, 156, 160, 175, 191, 198, 208,
  213, 216, 218, 232, 260, 289, 291, 319, 334, 348, 380, 381, 388, 483, 493,
  499
];

/** @type {Record<number, { pickDescription: string; whyIncluded: string }>} */
const ENRICH = {
  11: {
    pickDescription:
      "Dystopian literary classic: a theocratic regime reduces women to enforced reproductive roles. Cold, sharp, and still-culturally omnipresent.",
    whyIncluded: `<ul class="cites">
<li><strong>Modern classic:</strong> <a href="https://en.wikipedia.org/wiki/The_Handmaid%27s_Tale">Wikipedia: <em>The Handmaid’s Tale</em></a> (Atwood, 1985).</li>
<li><strong>Reason:</strong> Canonical contemporary literature; often assigned/taught and widely referenced in “best novels” discourse.</li>
</ul>`
  },
  24: {
    pickDescription:
      "Big-hearted American “modern classic” about faith, friendship, and fate, anchored by one of contemporary fiction’s most memorable characters.",
    whyIncluded: `<ul class="cites">
<li><strong>Respected author:</strong> <a href="https://en.wikipedia.org/wiki/John_Irving">Wikipedia: John Irving</a>.</li>
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/A_Prayer_for_Owen_Meany">Wikipedia: <em>A Prayer for Owen Meany</em></a> (1989).</li>
</ul>`
  },
  40: {
    pickDescription:
      "Same novel as item 11, but packaged as a special edition with an added essay—good if you like a little extra context alongside the text.",
    whyIncluded: `<ul class="cites">
<li><strong>See:</strong> <a href="https://en.wikipedia.org/wiki/The_Handmaid%27s_Tale">Wikipedia: <em>The Handmaid’s Tale</em></a>.</li>
<li><strong>Reason:</strong> Included because you asked to “include too much vs too little” for major authors/works.</li>
</ul>`
  },
  47: {
    pickDescription:
      "Interlinked Vietnam War stories (not a conventional novel): brutal, humane, and formally inventive—often treated as essential late-20th-century American literature.",
    whyIncluded: `<ul class="cites">
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Things_They_Carried">Wikipedia: <em>The Things They Carried</em></a> (1990).</li>
<li><strong>Reason:</strong> Frequently taught/anthologized; “modern classic” status for U.S. literature courses.</li>
</ul>`
  },
  68: {
    pickDescription:
      "Jazz Age tragedy and American classic (1925): desire, status, self-invention, and the hollowness at the center of the dream.",
    whyIncluded: `<ul class="cites">
<li><strong>Pre-1960 / canon:</strong> <a href="https://www.britannica.com/topic/The-Great-Gatsby">Britannica: <em>The Great Gatsby</em></a> (Fitzgerald).</li>
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Great_Gatsby">Wikipedia: <em>The Great Gatsby</em></a>.</li>
</ul>`
  },
  89: {
    pickDescription:
      "Political economy critique of corporate globalization and its human costs, written for a general reader by a highly influential public intellectual.",
    whyIncluded: `<ul class="cites">
<li><strong>Influential author:</strong> <a href="https://en.wikipedia.org/wiki/Noam_Chomsky">Wikipedia: Noam Chomsky</a>.</li>
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Profit_over_People">Wikipedia: <em>Profit over People</em></a>.</li>
</ul>`
  },
  108: {
    pickDescription:
      "Classics (Greek/Roman) essays by a leading scholar—good if you like “classic literature” adjacent reading that sharpens how you read the canon.",
    whyIncluded: `<ul class="cites">
<li><strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Mary_Beard_(classicist)">Wikipedia: Mary Beard</a>.</li>
<li><strong>Reason:</strong> Canon-adjacent nonfiction from a top classicist.</li>
</ul>`
  },
  113: {
    pickDescription:
      "Foundational modern criticism on how photos shape meaning, morality, and memory. Dense but hugely influential in art/culture writing.",
    whyIncluded: `<ul class="cites">
<li><strong>Award/influence:</strong> <a href="https://en.wikipedia.org/wiki/On_Photography">Wikipedia: <em>On Photography</em></a> (NBCC Award for Criticism; 1977).</li>
<li><strong>Primary venue:</strong> Essays originated in <a href="https://www.nybooks.com/">The New York Review of Books</a> (see Wikipedia for citations).</li>
</ul>`
  },
  134: {
    pickDescription:
      "One of the towering Western classics: Dante’s guided journey through Hell, Purgatory, and Paradise (here in a modern English translation).",
    whyIncluded: `<ul class="cites">
<li><strong>Canon:</strong> <a href="https://www.britannica.com/topic/Divine-Comedy">Britannica: <em>Divine Comedy</em></a>.</li>
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Divine_Comedy">Wikipedia: <em>Divine Comedy</em></a>.</li>
</ul>`
  },
  151: {
    pickDescription:
      "Hardboiled Harlem crime with bite and dark comedy—an important mid-century Black American novelist in full voice.",
    whyIncluded: `<ul class="cites">
<li><strong>Pre-1960:</strong> <a href="https://en.wikipedia.org/wiki/A_Rage_in_Harlem">Wikipedia: <em>A Rage in Harlem</em></a> (1957).</li>
<li><strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Chester_Himes">Wikipedia: Chester Himes</a>.</li>
</ul>`
  },
  156: {
    pickDescription:
      "Murakami mega-novel: a reality-slip love story and conspiracy labyrinth. Not a ‘classic’ in age, but widely discussed as a major late work.",
    whyIncluded: `<ul class="cites">
<li><strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Haruki_Murakami">Wikipedia: Haruki Murakami</a>.</li>
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/1Q84">Wikipedia: <em>1Q84</em></a>.</li>
</ul>`
  },
  160: {
    pickDescription:
      "Seminal evolutionary biology book that shaped how non-specialists talk about selection, genes, and behavior.",
    whyIncluded: `<ul class="cites">
<li><strong>Canonical nonfiction:</strong> <a href="https://en.wikipedia.org/wiki/The_Selfish_Gene">Wikipedia: <em>The Selfish Gene</em></a> (1976).</li>
<li><strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Richard_Dawkins">Wikipedia: Richard Dawkins</a>.</li>
</ul>`
  },
  175: {
    pickDescription:
      "Cyberpunk classic: fractured identities, corporate power, and slick high-tech paranoia in Gibson’s Sprawl world.",
    whyIncluded: `<ul class="cites">
<li><strong>Renowned SFF:</strong> <a href="https://en.wikipedia.org/wiki/Mona_Lisa_Overdrive">Wikipedia: <em>Mona Lisa Overdrive</em></a>.</li>
<li><strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/William_Gibson">Wikipedia: William Gibson</a>.</li>
</ul>`
  },
  191: {
    pickDescription:
      "Frenetic near-future satire that helped define how people imagine the internet/metaverse—smart, funny, and historically influential.",
    whyIncluded: `<ul class="cites">
<li><strong>List citation:</strong> <a href="https://stacker.com/stories/4476/100-best-science-fiction-novels-all-time">Stacker: 100 best science fiction novels</a> (includes <em>Snow Crash</em>).</li>
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Snow_Crash">Wikipedia: <em>Snow Crash</em></a>.</li>
</ul>`
  },
  198: {
    pickDescription:
      "Original Oz novel (1900): the source text behind the cultural phenomenon—short, odd, and historically fascinating.",
    whyIncluded: `<ul class="cites">
<li><strong>Pre-1960 / classic:</strong> <a href="https://en.wikipedia.org/wiki/The_Wonderful_Wizard_of_Oz">Wikipedia: <em>The Wonderful Wizard of Oz</em></a> (1900).</li>
<li><strong>Reason:</strong> Enduring cultural and literary legacy.</li>
</ul>`
  },
  208: {
    pickDescription:
      "Stephenson historical-tech maximalism: the rise of computing/cryptography through the lens of 17th–18th century economics and politics (dense but rewarding).",
    whyIncluded: `<ul class="cites">
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Baroque_Cycle">Wikipedia: <em>The Baroque Cycle</em></a> (see <em>King of the Vagabonds</em>).</li>
<li><strong>Reason:</strong> Well-known, ambitious “ideas fiction” by a major contemporary SFF author.</li>
</ul>`
  },
  213: {
    pickDescription:
      "Vonnegut’s morally jagged WWII/espionage novel: identity, complicity, and performance under totalitarianism.",
    whyIncluded: `<ul class="cites">
<li><strong>Famous author:</strong> <a href="https://en.wikipedia.org/wiki/Kurt_Vonnegut">Wikipedia: Kurt Vonnegut</a>.</li>
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Mother_Night">Wikipedia: <em>Mother Night</em></a> (1961).</li>
</ul>`
  },
  216: {
    pickDescription:
      "Early Heinlein future-history political sci-fi stories/novel fix-up: ideological arguments in pulp form—historically significant in genre history.",
    whyIncluded: `<ul class="cites">
<li><strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Robert_A._Heinlein">Wikipedia: Robert A. Heinlein</a>.</li>
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Revolt_in_2100">Wikipedia: <em>Revolt in 2100</em></a>.</li>
</ul>`
  },
  218: {
    pickDescription:
      "Another core Sprawl-era Gibson novel—tight, cool, and foundational cyberpunk aesthetics and themes.",
    whyIncluded: `<ul class="cites">
<li><strong>Renowned SFF:</strong> <a href="https://en.wikipedia.org/wiki/Count_Zero">Wikipedia: <em>Count Zero</em></a>.</li>
<li><strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/William_Gibson">Wikipedia: William Gibson</a>.</li>
</ul>`
  },
  232: {
    pickDescription:
      "The opening novel of Stephenson’s sprawling Baroque Cycle (long, intricate, historically playful).",
    whyIncluded: `<ul class="cites">
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Quicksilver_(novel)">Wikipedia: <em>Quicksilver</em></a>.</li>
<li><strong>Reason:</strong> Widely regarded as major historical/SFF hybrid work.</li>
</ul>`
  },
  260: {
    pickDescription:
      "Vonnegut’s debut (1952): dystopia of automation and engineered social classes—eerily relevant and very “modern classic sci-fi satire.”",
    whyIncluded: `<ul class="cites">
<li><strong>Pre-1960 + famous author:</strong> <a href="https://en.wikipedia.org/wiki/Player_Piano_(novel)">Wikipedia: <em>Player Piano</em></a> (1952).</li>
<li><strong>Reason:</strong> You asked to include all works by famous authors like Vonnegut.</li>
</ul>`
  },
  289: {
    pickDescription:
      "Often cited as a favorite Vonnegut: cosmic satire, fate, and meaning-making with a surprisingly tender core.",
    whyIncluded: `<ul class="cites">
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Sirens_of_Titan">Wikipedia: <em>The Sirens of Titan</em></a> (1959; pre-1960).</li>
<li><strong>Reason:</strong> Famous author + meets your pre-1960 cutoff.</li>
</ul>`
  },
  291: {
    pickDescription:
      "Historical fantasy inspired by medieval Spain—lyrical, tragic, and widely loved among readers who want “literary fantasy.”",
    whyIncluded: `<ul class="cites">
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Lions_of_Al-Rassan">Wikipedia: <em>The Lions of Al-Rassan</em></a>.</li>
<li><strong>Signal:</strong> Frequently recommended in “best fantasy” discussions; see example list coverage: <a href="https://www.goodreads.com/list/show/108932.Best_Guy_Gavriel_Kay_Books">Goodreads list: Best Guy Gavriel Kay</a>.</li>
</ul>`
  },
  319: {
    pickDescription:
      "Heinlein mid-century sci-fi novel: big ideas, social thought-experiments, and the genre’s historical backbone.",
    whyIncluded: `<ul class="cites">
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Beyond_This_Horizon">Wikipedia: <em>Beyond This Horizon</em></a> (1942; pre-1960).</li>
<li><strong>Reason:</strong> Genre-canon author and early sci-fi lineage.</li>
</ul>`
  },
  334: {
    pickDescription:
      "Foundational existential philosophy text (Kierkegaard) in a modern translation—classic non-fiction/philosophy for the canon shelf.",
    whyIncluded: `<ul class="cites">
<li><strong>Philosophy canon:</strong> <a href="https://en.wikipedia.org/wiki/The_Concept_of_Anxiety">Wikipedia: <em>The Concept of Anxiety</em></a> (1844).</li>
<li><strong>Reason:</strong> Underlying text is firmly pre-1960 and “great books” adjacent.</li>
</ul>`
  },
  348: {
    pickDescription:
      "Tolstoy’s devastating late novella about mortality + his spiritual crisis writing. Short, direct, and canonically great.",
    whyIncluded: `<ul class="cites">
<li><strong>Canon:</strong> <a href="https://en.wikipedia.org/wiki/The_Death_of_Ivan_Ilyich">Wikipedia: <em>The Death of Ivan Ilyich</em></a> (1886).</li>
<li><strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Leo_Tolstoy">Wikipedia: Leo Tolstoy</a>.</li>
</ul>`
  },
  380: {
    pickDescription:
      "Kafka’s classic of alienation and absurdity (1915): a man wakes as an insect and the world’s response is the horror.",
    whyIncluded: `<ul class="cites">
<li><strong>Pre-1960 / classic:</strong> <a href="https://en.wikipedia.org/wiki/The_Metamorphosis">Wikipedia: <em>The Metamorphosis</em></a> (1915).</li>
<li><strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Franz_Kafka">Wikipedia: Franz Kafka</a>.</li>
</ul>`
  },
  381: {
    pickDescription:
      "Classic case-history nonfiction from a neurologist/writer: strange conditions rendered with empathy and narrative craft.",
    whyIncluded: `<ul class="cites">
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Man_Who_Mistook_His_Wife_for_a_Hat">Wikipedia: <em>The Man Who Mistook His Wife for a Hat</em></a>.</li>
<li><strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Oliver_Sacks">Wikipedia: Oliver Sacks</a>.</li>
</ul>`
  },
  388: {
    pickDescription:
      "Nano/education future: a stolen interactive ‘primer’ reshapes a girl’s life. Classic-of-the-1990s hard-ish sci-fi imagination.",
    whyIncluded: `<ul class="cites">
<li><strong>List citation:</strong> <a href="https://www.technologyreview.com/s/424202/the-best-hard-science-fiction-books-of-all-time/">MIT Technology Review: best hard sci-fi books</a> (includes <em>The Diamond Age</em>).</li>
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Diamond_Age">Wikipedia: <em>The Diamond Age</em></a>.</li>
</ul>`
  },
  483: {
    pickDescription:
      "Late Vonnegut comedy of American institutions and corruption—bitter, funny, and still recognizably his voice.",
    whyIncluded: `<ul class="cites">
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Jailbird_(novel)">Wikipedia: <em>Jailbird</em></a>.</li>
<li><strong>Reason:</strong> Included to capture all Vonnegut items present in this pull.</li>
</ul>`
  },
  493: {
    pickDescription:
      "Vonnegut’s evolutionary fable: a mishap strands people on an island and the species (maybe) adapts away from human obsession.",
    whyIncluded: `<ul class="cites">
<li><strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Gal%C3%A1pagos_(novel)">Wikipedia: <em>Galápagos</em></a>.</li>
<li><strong>Reason:</strong> Included to capture all Vonnegut items present in this pull.</li>
</ul>`
  },
  499: {
    pickDescription:
      "Zola’s big-money novel (1891): speculation, corruption, and social forces—classic realist/naturalist fiction by a major French author.",
    whyIncluded: `<ul class="cites">
<li><strong>Pre-1960 / classic author:</strong> <a href="https://en.wikipedia.org/wiki/L%27Argent">Wikipedia: <em>L’Argent</em> (<em>Money</em>)</a> (1891).</li>
<li><strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/%C3%89mile_Zola">Wikipedia: Émile Zola</a>.</li>
</ul>`
  }
};

const SRC_JSON = path.join(root, "out/results-2026-05-05T11-40-24.json");
const OUT_HTML = path.join(root, "out/report-2026-05-05T11-40-24-classic-picks.html");

const payload = JSON.parse(fs.readFileSync(SRC_JSON, "utf8"));
const want = new Set(PICK_ORDER);
const byNum = new Map(
  payload.results
    .filter((r) => want.has(r.itemNumber))
    .map((r) => [r.itemNumber, r])
);

const missing = PICK_ORDER.filter((n) => !byNum.has(n));
if (missing.length) {
  console.error("Missing itemNumbers in source:", missing);
  process.exit(1);
}

const noEnrich = PICK_ORDER.filter((n) => !ENRICH[n]);
if (noEnrich.length) {
  console.error("Missing ENRICH blocks for:", noEnrich);
  process.exit(1);
}

const enrichedResults = PICK_ORDER.map((n) => {
  const row = { ...byNum.get(n) };
  const extra = ENRICH[n];
  row.pickDescription = extra.pickDescription;
  row.whyIncluded = extra.whyIncluded;
  return row;
});

const outPayload = {
  meta: {
    ...payload.meta,
    count: enrichedResults.length,
    subtitle: "2026-05-05 — classic / canon / renowned SFF picks (curated)",
    sourceResults: "results-2026-05-05T11-40-24.json",
    pickItemNumbers: PICK_ORDER
  },
  results: enrichedResults
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Unpaginate report — 2026-05-05 picks</title>
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
  <h1>Unpaginate report — 2026-05-05 picks</h1>
  <p class="meta">
    Curated subset ·
    Count: ${outPayload.meta.count} ·
    Source: <code>${outPayload.meta.sourceResults}</code> ·
    Generated: ${new Date().toISOString()}
  </p>
  <p class="meta" style="font-size: 13px;">
    Columns <strong>pickDescription</strong> and <strong>whyIncluded</strong> were added for this view.
    Sort by clicking headers. Filter with inputs under headers. Drag column headers to reorder.
  </p>
  <p class="meta" id="unpaginate-review-toolbar" style="font-size: 13px;">
    <strong>Review:</strong>
    check <strong>Hide</strong> on a row to remove it from the table (session only; refresh restores everything).
    <button type="button" id="unpaginate-show-all-rows" style="margin-left: 0.5rem;">Show all hidden rows</button>
    <span id="unpaginate-hidden-count-wrap" style="margin-left: 0.35rem;">(<span id="unpaginate-hidden-count">0</span> hidden)</span>
  </p>
  <div id="grid"></div>
  <script type="application/json" id="unpaginate-data">${JSON.stringify(outPayload).replace(/</g, "\\u003c")}</script>
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
  function cellFormatter(cell) {
    var v = cell.getValue();
    var col = cell.getField();
    if (v === null || v === undefined) return "";
    if (col === "whyIncluded" && typeof v === "string") {
      return v; // trusted HTML (curated)
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
      def.minWidth = 340;
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

