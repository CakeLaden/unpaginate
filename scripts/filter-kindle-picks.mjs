/**
 * Filter unpaginate Kindle results against KINDLE_SELECTION_PREFERENCES.md signals.
 * Usage: node scripts/filter-kindle-picks.mjs [path/to/results.json]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function norm(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`]/g, "'")
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseAuthors(authorField) {
  const raw = String(authorField ?? "");
  const parts = raw.split(/\s*\|\s*/);
  const authors = [];
  for (const part of parts) {
    const m = part.match(/\bby\s+(.+)/i);
    if (m) authors.push(m[1].trim());
  }
  if (!authors.length && raw.trim()) authors.push(raw.trim());
  return authors;
}

function authorMatches(haystackAuthors, needleAuthor) {
  const tokens = norm(needleAuthor)
    .split(/[\s.]+/)
    .filter((w) => w.length > 2 || (w.length === 1 && /[a-z]/.test(w)));
  if (!tokens.length) return false;
  return haystackAuthors.some((a) => {
    const an = norm(a);
    return tokens.every((t) => an.includes(t));
  });
}

function titleMatches(title, needleTitle, mode = "fuzzy") {
  const t = norm(title);
  const n = norm(needleTitle);
  if (!t || !n) return false;
  if (t === n) return true;

  // Short / ambiguous titles need exact normalized match
  if (n.length < 12 || n.split(" ").length <= 1) {
    return t === n || t.startsWith(n + " ") || t.endsWith(" " + n);
  }

  if (mode === "exact") {
    return t === n;
  }

  if (t.includes(n) || n.includes(t)) {
    // Avoid substring traps: "goldfinch" in unrelated series titles, etc.
    if (n.length >= 10) return true;
    const re = new RegExp(`(^|\\s)${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|:|$)`);
    return re.test(t);
  }

  const nWords = n.split(" ").filter((w) => w.length > 2);
  if (nWords.length >= 2) {
    const hits = nWords.filter((w) => t.includes(w));
    if (hits.length >= Math.ceil(nWords.length * 0.8)) return true;
  }
  return false;
}

// --- Amazon wishlist (KINDLE_SELECTION_PREFERENCES.md) ---
const AMAZON_WISHLIST_TITLES = [
  "To Be Taught, If Fortunate",
  "The Complete Book of the New Sun",
  "Paradais",
  "Bel Canto",
  "Babel: Or the Necessity of Violence",
  "Blood Meridian",
  "Tom Lake",
  "Artemis",
  "The Invisible Life of Addie LaRue",
  "Circe",
  "Atomic Habits",
  "Mistborn: The Final Empire",
  "Little Eyes",
  "The Last Unicorn",
  "Yr Dead",
  "Martyr!",
  "The Heart in Winter",
  "The Tao of Pooh",
  "Marabou Stork Nightmares",
  "House of Leaves",
  "James",
  "Drive Your Plow Over the Bones of the Dead",
  "The Long Way to a Small, Angry Planet",
  "Disgrace",
  "Butcher's Crossing",
  "Augustus",
  "Savages",
  "A Children's Bible",
  "The Secret History",
  "We Have Always Lived in the Castle",
  "A Wrinkle in Time",
  "The Graveyard Book",
  "Beyond Good and Evil",
  "The Myth of Sisyphus",
  "Existentialism Is a Humanism",
  "Pnin",
  "The House in the Cerulean Sea",
  "The Hamlet",
  "The Cloven Viscount",
  "The Dog Stars",
  "Land",
  "The Night Circus",
  "Jonathan Livingston Seagull",
  "Tuesdays with Morrie",
  "The Little Prince",
  "The Annotated American Gods",
  "Bluets",
  "Arcadia",
  "A Confession",
  "A Universe from Nothing",
];

const AMAZON_WISHLIST_AUTHORS = [
  "Albert Camus",
  "Andy Weir",
  "Ann Patchett",
  "Anne Fadiman",
  "Antoine de Saint-Exupéry",
  "Becky Chambers",
  "Becky Kennedy",
  "Benjamin Hoff",
  "Brandon Sanderson",
  "Brianna Wiest",
  "Cormac McCarthy",
  "Daniel Clowes",
  "Daniel J. Siegel",
  "Daniel Kraus",
  "Don Winslow",
  "Donna Tartt",
  "Erin Morgenstern",
  "Fernanda Melchor",
  "Gene Wolfe",
  "Grace Lin",
  "Hilton Als",
  "Irvine Welsh",
  "Italo Calvino",
  "J. M. Coetzee",
  "James Clear",
  "John Williams",
  "Kevin Barry",
  "Kaveh Akbar",
  "Lawrence M. Krauss",
  "Leo Tolstoy",
  "Lydia Millet",
  "Madeleine L'Engle",
  "Madeline Miller",
  "Maggie Nelson",
  "Maggie O'Farrell",
  "Mark Z. Danielewski",
  "Mitch Albom",
  "Neil Gaiman",
  "Olga Tokarczuk",
  "Patrick Rothfuss",
  "Percival Everett",
  "Peter Brown",
  "Peter Heller",
  "Peter S. Beagle",
  "R. F. Kuang",
  "Richard Bach",
  "Richard Mabey",
  "Sam Anderson",
  "Sam Sax",
  "Samanta Schweblin",
  "Shirley Jackson",
  "Steven S. Gubser",
  "TJ Klune",
  "Tom Stoppard",
  "V. E. Schwab",
  "Vladimir Nabokov",
  "William Faulkner",
];

// --- Audible wishlist highlights ---
const AUDIBLE_WISHLIST_TITLES = [
  "Klara and the Sun",
  "There Is No Antimemetics Division",
  "Kafka on the Shore",
  "Underworld",
  "Flowers for Algernon",
  "Siddhartha",
  "Jonathan Strange & Mr Norrell",
  "The Midnight Library",
  "Piranesi",
  "The Dispossessed",
  "The Lathe of Heaven",
  "And Then There Were None",
  "Watership Down",
  "Flatland",
  "Tomorrow, and Tomorrow, and Tomorrow",
  "Always Coming Home",
  "The End of the Affair",
  "Howl's Moving Castle",
  "The Covenant of Water",
  "The Corrections",
  "Middlesex",
  "Contact",
  "Stranger in a Strange Land",
  "Foundation",
  "East of Eden",
  "The Goldfinch",
  "The Remains of the Day",
  "Rebecca",
  "Brave New World",
  "The Hitchhiker's Guide to the Galaxy",
  "Fahrenheit 451",
  "Moby-Dick",
  "The Color Purple",
  "The Magic Mountain",
  "On the Road",
  "Wise Blood",
  "The Fellowship of the Ring",
  "The Silmarillion",
  "The Alchemist",
  "The Divine Comedy",
  "The Count of Monte Cristo",
  "Lonesome Dove",
  "Normal People",
  "Transcription",
  "The Blade Itself",
  "Children of Time",
  "Five Ways to Forgiveness",
  "A Hologram for the King",
  "A Heartbreaking Work of Staggering Genius",
  "A Court of Thorns and Roses",
  "Thus Spoke Zarathustra",
  "Underland",
  "Anxious People",
  "Nabokov's Favorite Word Is Mauve",
  "The Witch",
  "Against Interpretation and Other Essays",
  "Heroes",
  "Mythos",
  "One Day, Everyone Will Have Always Been Against This",
  "Things in Nature Merely Grow",
  "The Getaway",
  "The Correspondent",
  "Theo of Golden",
  "Shadow of the Torturer",
  "The Shadow of the Torturer",
];

const AUDIBLE_WISHLIST_AUTHORS = [
  "Abraham Verghese",
  "Adrian Tchaikovsky",
  "Agatha Christie",
  "Aldous Huxley",
  "Alexandre Dumas",
  "Alice Walker",
  "Allen Levi",
  "Ann Patchett",
  "Ben Lerner",
  "Carl Sagan",
  "Daphne du Maurier",
  "Dave Eggers",
  "Diana Wynne Jones",
  "Don DeLillo",
  "Douglas Adams",
  "E. B. White",
  "Edwin Abbott",
  "Flannery O'Connor",
  "Fredrik Backman",
  "Friedrich Nietzsche",
  "Gabriel García Márquez",
  "Gabriel Garcia Marquez",
  "Graham Greene",
  "Haruki Murakami",
  "Herman Hesse",
  "Herman Melville",
  "Isaac Asimov",
  "J. R. R. Tolkien",
  "Jack Kerouac",
  "Jean-Paul Sartre",
  "Joan Didion",
  "John Steinbeck",
  "Jonathan Franzen",
  "Kazuo Ishiguro",
  "Kurt Vonnegut",
  "Larry McMurtry",
  "Margaret Atwood",
  "Marie NDiaye",
  "Matt Haig",
  "N. K. Jemisin",
  "Octavia E. Butler",
  "Philip Gabriel",
  "qntm",
  "Ray Bradbury",
  "Richard Adams",
  "Robert A. Heinlein",
  "Robert Macfarlane",
  "Sally Rooney",
  "Stephen Fry",
  "Stephen King",
  "Susan Sontag",
  "Susanna Clarke",
  "Thomas Mann",
  "Thomas Pynchon",
  "Umberto Eco",
  "Ursula K. Le Guin",
  "William S. Burroughs",
  "Yiyun Li",
  "Gabrielle Zevin",
  "Joe Abercrombie",
  "Jim Thompson",
  "Omar El Akkad",
  "Sarah J. Maas",
  "Virginia Evans",
];

// --- Personal interest / canon titles (distinctive only) ---
const INTEREST_TITLES = [
  "1984",
  "Catch-22",
  "The Catcher in the Rye",
  "Crime and Punishment",
  "Lolita",
  "Pale Fire",
  "To the Lighthouse",
  "Under the Volcano",
  "Jane Eyre",
  "One Hundred Years of Solitude",
  "The Left Hand of Darkness",
  "Parable of the Sower",
  "The Fifth Season",
  "Stardust",
  "American Gods",
  "The Name of the Rose",
  "Infinite Jest",
  "Gravity's Rainbow",
  "The Crying of Lot 49",
  "Slaughterhouse-Five",
  "Player Piano",
  "Cat's Cradle",
  "The Sirens of Titan",
  "Breakfast of Champions",
  "The Handmaid's Tale",
  "The Great Gatsby",
  "The Brothers Karamazov",
  "Anna Karenina",
  "War and Peace",
  "The Trial",
  "The Metamorphosis",
  "Ulysses",
  "Mrs Dalloway",
  "Wuthering Heights",
  "Great Expectations",
  "Pride and Prejudice",
  "Frankenstein",
  "Dracula",
  "Heart of Darkness",
  "Lord of the Flies",
  "Animal Farm",
  "The Lord of the Rings",
  "The Hobbit",
  "Dune",
  "Neuromancer",
  "Do Androids Dream of Electric Sheep",
  "Kindred",
  "Beloved",
  "Invisible Man",
  "Their Eyes Were Watching God",
  "Meditations",
  "Man's Search for Meaning",
  "The Black Swan",
  "Braiding Sweetgrass",
  "The Overstory",
  "Things Fall Apart",
  "Wide Sargasso Sea",
  "Blood Meridian",
  "All the Pretty Horses",
  "The Road",
  "No Country for Old Men",
  "White Noise",
  "A Confederacy of Dunces",
  "The Stranger",
  "The Plague",
  "The Bell Jar",
  "East of Eden",
  "A Raisin in the Sun",
  "The Dispossessed",
  "Flowers for Algernon",
  "Foundation",
  "Stranger in a Strange Land",
  "The Hitchhiker's Guide to the Galaxy",
  "Brave New World",
  "Fahrenheit 451",
  "Moby-Dick",
  "1984",
  "V.",
  "Post Office",
  "Tropic of Cancer",
  "Under the Net",
  "Riddley Walker",
  "The Painted Bird",
  "Fun Home",
  "Maus",
  "The Bloody Chamber",
  "Jonathan Strange & Mr Norrell",
  "Red Rising",
  "Intermezzo",
  "The Book Thief",
  "The Getaway",
  "Paradais",
];

// Include every work by these authors when present
const ALL_WORKS_AUTHORS = [
  "Kurt Vonnegut",
  "William S. Burroughs",
  "William Burroughs",
  "Thomas Pynchon",
  "Ursula K. Le Guin",
  "Octavia E. Butler",
  "Octavia Butler",
  "Flannery O'Connor",
  "Joan Didion",
  "Gabriel García Márquez",
  "Gabriel Garcia Marquez",
  "John Steinbeck",
  "Margaret Atwood",
  "Donna Tartt",
  "Umberto Eco",
  "Jean Rhys",
  "N. K. Jemisin",
  "Neil Gaiman",
];

function scoreRow(row) {
  const authors = parseAuthors(row.author);
  const title = row.title ?? "";
  const reasons = [];

  for (const wt of AMAZON_WISHLIST_TITLES) {
    if (titleMatches(title, wt)) {
      reasons.push({ type: "amazon-wishlist-title", match: wt });
    }
  }
  for (const wt of AUDIBLE_WISHLIST_TITLES) {
    if (titleMatches(title, wt)) {
      reasons.push({ type: "audible-wishlist-title", match: wt });
    }
  }
  for (const wt of INTEREST_TITLES) {
    if (titleMatches(title, wt)) {
      reasons.push({ type: "interest-title", match: wt });
    }
  }

  for (const wa of AMAZON_WISHLIST_AUTHORS) {
    if (authorMatches(authors, wa)) {
      reasons.push({ type: "amazon-wishlist-author", match: wa });
    }
  }
  for (const wa of AUDIBLE_WISHLIST_AUTHORS) {
    if (authorMatches(authors, wa)) {
      reasons.push({ type: "audible-wishlist-author", match: wa });
    }
  }
  for (const wa of ALL_WORKS_AUTHORS) {
    if (authorMatches(authors, wa)) {
      reasons.push({ type: "canon-author-all-works", match: wa });
    }
  }

  if (!reasons.length) return null;

  return {
    ...row,
    whyIncluded: reasons,
    matchSummary: reasons.map((r) => `${r.type}: ${r.match}`).join("; "),
    matchTypes: [...new Set(reasons.map((r) => r.type))],
  };
}

function findLatestResults(dir) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("results-") && f.endsWith(".json"))
    .map((f) => ({ f, m: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  return files[0]?.f;
}

const srcArg = process.argv[2];
const outDir = path.join(root, "out");
const srcFile = srcArg
  ? path.resolve(srcArg)
  : path.join(outDir, findLatestResults(outDir) ?? "");

if (!srcFile || !fs.existsSync(srcFile)) {
  console.error("No results JSON found. Pass a path or run unpaginate first.");
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(srcFile, "utf8"));
const picks = [];
for (const row of payload.results) {
  const scored = scoreRow(row);
  if (scored) picks.push(scored);
}

picks.sort((a, b) => a.itemNumber - b.itemNumber);

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outJson = path.join(outDir, `kindle-picks-${stamp}.json`);
const outHtml = path.join(outDir, `kindle-picks-${stamp}.html`);

const outPayload = {
  meta: {
    ...payload.meta,
    sourceResults: path.basename(srcFile),
    filteredAt: new Date().toISOString(),
    sourceCount: payload.results.length,
    pickCount: picks.length,
    subtitle: "Kindle Double Scoop — preference matches",
  },
  results: picks,
};

fs.writeFileSync(outJson, JSON.stringify(outPayload, null, 2));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kindle Double Scoop — preference picks</title>
  <link rel="stylesheet" href="https://unpkg.com/tabulator-tables@6.3.1/dist/css/tabulator.min.css" />
  <style>
    body { font-family: system-ui, sans-serif; margin: 1rem; }
    .meta { color: #444; margin-bottom: 1rem; font-size: 14px; }
    #grid { margin-top: 0.5rem; }
    .tabulator .tabulator-row { min-height: 120px; }
    .tabulator .tabulator-cell { white-space: normal; word-break: break-word; }
    .tabulator .cell-image img { max-height: 100px; object-fit: contain; }
  </style>
</head>
<body>
  <h1>Kindle Double Scoop — preference picks</h1>
  <p class="meta">
    Source: <code>${outPayload.meta.sourceResults}</code> (${outPayload.meta.sourceCount} crawled) ·
    Matches: ${outPayload.meta.pickCount} ·
    Generated: ${outPayload.meta.filteredAt}
  </p>
  <div id="grid"></div>
  <script type="application/json" id="unpaginate-data">${JSON.stringify(outPayload)}</script>
  <script src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
  <script>
(function () {
  function esc(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
  var payload = JSON.parse(document.getElementById("unpaginate-data").textContent);
  var rows = payload.results.map(function (r) {
    return {
      itemNumber: r.itemNumber,
      title: r.title,
      author: (r.author || "").replace(/\\s+/g, " ").trim(),
      matchSummary: r.matchSummary,
      cover: r.cover,
      href: r.href ? (r.href.startsWith("http") ? r.href : "https://www.amazon.com" + r.href) : "",
      pageIndex: r._meta && r._meta.pageIndex
    };
  });
  new Tabulator("#grid", {
    data: rows,
    layout: "fitColumns",
    pagination: "local",
    paginationSize: 50,
    movableColumns: true,
    columns: [
      { field: "itemNumber", title: "#", width: 60 },
      { field: "title", title: "title", headerFilter: "input", widthGrow: 2 },
      { field: "author", title: "author", headerFilter: "input", widthGrow: 2 },
      { field: "matchSummary", title: "whyIncluded", headerFilter: "input", widthGrow: 3 },
      { field: "cover", title: "cover", width: 90, formatter: function(c) {
        var v = c.getValue(); return v ? '<img src="'+esc(v)+'" alt="" style="max-height:100px"/>' : '';
      }},
      { field: "href", title: "link", width: 80, formatter: function(c) {
        var v = c.getValue(); return v ? '<a href="'+esc(v)+'" target="_blank" rel="noopener">Amazon</a>' : '';
      }}
    ]
  });
})();
  </script>
</body>
</html>`;

fs.writeFileSync(outHtml, html, "utf8");

console.log(`Source: ${srcFile} (${payload.results.length} items)`);
console.log(`Matches: ${picks.length}`);
console.log(`Wrote ${outJson}`);
console.log(`Wrote ${outHtml}`);

if (picks.length) {
  console.log("\nSample matches:");
  for (const p of picks.slice(0, 20)) {
    console.log(`  #${p.itemNumber} ${p.title}`);
    console.log(`    ${p.matchSummary}`);
  }
}
