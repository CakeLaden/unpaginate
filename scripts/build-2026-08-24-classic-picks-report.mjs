/**
 * Curated 2-for-1 picks from 2026-08-24 unpaginate results.
 * Run: node scripts/build-2026-08-24-classic-picks-report.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function cites(items) {
  return `<ul class="cites">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
}

// Ordered by how strongly they match AUDIOBOOK_SELECTION_PREFERENCES.md
const PICK_ORDER = [
  246, 140, 444, 194, 167, 71, 181, 232, 480, 240, 189, 405, 168, 48, 27, 231,
  213, 233, 84, 466, 201, 441, 423, 146, 239, 28, 110, 171, 158, 325, 34, 87,
  125, 312, 482, 432, 453, 459, 401, 268
];

/** @type {Record<number, { lane: string; pickDescription: string; whyIncluded: string }>} */
const ENRICH = {
  246: {
    lane: "wishlist / interest",
    pickDescription:
      "Pynchon’s WWII mega-novel: paranoia, entropy, rockets, and slapstick at maximal density. On your interest list; a 2-for-1 credit is a rare cheap way to try the Guidall narration.",
    whyIncluded: cites([
      "<strong>Personal interest title:</strong> <em>Gravity’s Rainbow</em> is on your list.",
      '<strong>All-works author:</strong> <a href="https://en.wikipedia.org/wiki/Thomas_Pynchon">Thomas Pynchon</a>.',
      '<strong>List footprint:</strong> <a href="https://en.wikipedia.org/wiki/Gravity%27s_Rainbow">Wikipedia</a> (1973; National Book Award).'
    ])
  },
  140: {
    lane: "wishlist / interest",
    pickDescription:
      "Camus’s essay on absurdity, suicide, and meaning—short, lucid, and the core of his philosophy. Exact Amazon wishlist title; Ballerini is a strong narrator for this.",
    whyIncluded: cites([
      "<strong>Amazon wishlist title:</strong> <em>The Myth of Sisyphus</em>.",
      '<strong>Philosophy canon:</strong> <a href="https://en.wikipedia.org/wiki/The_Myth_of_Sisyphus">Wikipedia</a> (1942; pre-1960).',
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Albert_Camus">Albert Camus</a>.'
    ])
  },
  444: {
    lane: "wishlist / interest",
    pickDescription:
      "DeLillo’s baseball-to-nuclear-waste American epic: Cold War residue, waste, and the secret life of objects. Exact Audible wishlist title; long but the 2-for-1 math is excellent.",
    whyIncluded: cites([
      "<strong>Audible wishlist title:</strong> <em>Underworld</em>.",
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Don_DeLillo">Don DeLillo</a>.',
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Underworld_(DeLillo_novel)">Wikipedia: <em>Underworld</em></a> (1997).'
    ])
  },
  194: {
    lane: "wishlist / interest",
    pickDescription:
      "Franzen’s family-and-pharma social novel—midwestern decline, marriage, and late-90s America. Exact Audible wishlist title.",
    whyIncluded: cites([
      "<strong>Audible wishlist title:</strong> <em>The Corrections</em>.",
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Jonathan_Franzen">Jonathan Franzen</a>.',
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Corrections">Wikipedia</a> (National Book Award, 2001).'
    ])
  },
  167: {
    lane: "wishlist / interest",
    pickDescription:
      "Walker’s epistolary novel of Celie’s survival and voice in the Jim Crow South. Pulitzer/NBA winner; Walker reads it herself. Exact Audible wishlist title.",
    whyIncluded: cites([
      "<strong>Audible wishlist title:</strong> <em>The Color Purple</em>.",
      '<strong>Canon:</strong> <a href="https://en.wikipedia.org/wiki/The_Color_Purple">Wikipedia</a> (1982; Pulitzer Prize for Fiction).',
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Alice_Walker">Alice Walker</a>.'
    ])
  },
  71: {
    lane: "wishlist / interest",
    pickDescription:
      "Found-family space opera that’s gentle, funny, and character-first rather than military. Exact Amazon wishlist title (Wayfarers #1)—a clean starting point.",
    whyIncluded: cites([
      "<strong>Amazon wishlist title:</strong> <em>The Long Way to a Small, Angry Planet</em>.",
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Becky_Chambers">Becky Chambers</a>.',
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Long_Way_to_a_Small,_Angry_Planet">Wikipedia</a>.'
    ])
  },
  181: {
    lane: "wishlist / interest",
    pickDescription:
      "Murakami’s big Tokyo novel: a missing cat, a dry well, and history leaking into the everyday. Wishlist author; often cited as his major work beside <em>1Q84</em> / <em>Kafka on the Shore</em>.",
    whyIncluded: cites([
      "<strong>Audible wishlist author:</strong> Haruki Murakami.",
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Wind-Up_Bird_Chronicle">Wikipedia: <em>The Wind-Up Bird Chronicle</em></a> (1994–95).'
    ])
  },
  232: {
    lane: "wishlist / interest",
    pickDescription:
      "Middle book of McCarthy’s Border Trilogy: a boy, a wolf, and the Mexican border country. Bleak, biblical, and closer to <em>Blood Meridian</em> than the later novels. Wishlist author.",
    whyIncluded: cites([
      "<strong>Amazon wishlist author:</strong> Cormac McCarthy (<em>Blood Meridian</em> is on your list).",
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Crossing_(McCarthy_novel)">Wikipedia: <em>The Crossing</em></a> (1994).',
      "<strong>Note:</strong> Sequel to <em>All the Pretty Horses</em>; still readable as a standalone tragedy."
    ])
  },
  480: {
    lane: "classic",
    pickDescription:
      "Joyce’s last novel: dream-language, Dublin, and the river of history. Pre-1960 modernist monument. The McGovern/Riordan recording is one of the few ways this book becomes audible rather than merely visible.",
    whyIncluded: cites([
      '<strong>Pre-1960 / canon:</strong> <a href="https://en.wikipedia.org/wiki/Finnegans_Wake">Wikipedia: <em>Finnegans Wake</em></a> (1939).',
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/James_Joyce">James Joyce</a>.',
      "<strong>Reason:</strong> Greatest-books footprint; <em>Ulysses</em> is on your interest list."
    ])
  },
  240: {
    lane: "classic",
    pickDescription:
      "Hawthorne’s 1850 adultery-and-guilt novel of Puritan Boston. Short, canonical American literature; a low-risk second title in a 2-for-1 pair.",
    whyIncluded: cites([
      '<strong>Pre-1960 / canon:</strong> <a href="https://www.britannica.com/topic/The-Scarlet-Letter">Britannica: <em>The Scarlet Letter</em></a>.',
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Scarlet_Letter">Wikipedia</a> (1850).'
    ])
  },
  189: {
    lane: "classic",
    pickDescription:
      "Undset’s medieval Norwegian trilogy of Kristin’s life, marriage, and faith. Nobel-winning historical fiction; the Nunnally translation is the standard modern English text.",
    whyIncluded: cites([
      '<strong>Modern classic / Nobel:</strong> <a href="https://en.wikipedia.org/wiki/Kristin_Lavransdatter">Wikipedia: <em>Kristin Lavransdatter</em></a> (1920–22).',
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Sigrid_Undset">Sigrid Undset</a> (Nobel Prize in Literature, 1928).'
    ])
  },
  405: {
    lane: "classic",
    pickDescription:
      "DFW’s essay collection: tennis, TV, and the infamous luxury-cruise piece. If you want <em>Infinite Jest</em>’s voice without the 1,000-page novel, this is the on-ramp.",
    whyIncluded: cites([
      "<strong>Adjacent to interest title:</strong> <em>Infinite Jest</em> is on your list.",
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/A_Supposedly_Fun_Thing_I%27ll_Never_Do_Again">Wikipedia</a> (1997).',
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/David_Foster_Wallace">David Foster Wallace</a>.'
    ])
  },
  168: {
    lane: "wishlist / interest",
    pickDescription:
      "Full-cast audio drama of Gaiman’s Sandman (Act II). All-works Gaiman; this is the second season of the Audible adaptation, not the prose novels.",
    whyIncluded: cites([
      "<strong>All-works author:</strong> Neil Gaiman (on your interest / SFF list).",
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Sandman_(comic_book)">Wikipedia: <em>The Sandman</em></a>.',
      "<strong>Note:</strong> Audio drama, not a novel; Act I is the starting point if you have not heard it."
    ])
  },
  48: {
    lane: "wishlist / interest",
    pickDescription:
      "Third book of Tchaikovsky’s Children of Time sequence: terraforming, sentience, and unreliable memory. Wishlist author; <em>Children of Time</em> itself is on your Audible wishlist.",
    whyIncluded: cites([
      "<strong>Audible wishlist author:</strong> Adrian Tchaikovsky.",
      "<strong>Related wishlist title:</strong> <em>Children of Time</em> (this is book 3 of that sequence).",
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Children_of_Time_(novel)">Wikipedia: <em>Children of Time</em></a> series.'
    ])
  },
  27: {
    lane: "wishlist / interest",
    pickDescription:
      "Stormlight Archive novella following Lift. Short (6h), Sanderson is on your Amazon wishlist, and you flagged Stormlight / Mistborn as interest. Fine if you are already in that world; skip if you have not started <em>The Way of Kings</em>.",
    whyIncluded: cites([
      "<strong>Amazon wishlist author:</strong> Brandon Sanderson.",
      "<strong>Personal interest:</strong> Stormlight Archive is on your list.",
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Edgedancer_(novella)">Wikipedia: <em>Edgedancer</em></a>.'
    ])
  },
  231: {
    lane: "renowned SFF",
    pickDescription:
      "Culture novel about a traumatized special-circumstances agent and the weapon of a person. Widely treated as one of Banks’s best; renowned space-opera canon even if you have not read the series in order.",
    whyIncluded: cites([
      '<strong>Renowned SFF:</strong> <a href="https://en.wikipedia.org/wiki/Use_of_Weapons">Wikipedia: <em>Use of Weapons</em></a> (1990).',
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Iain_Banks">Iain M. Banks</a> / Culture series.',
      "<strong>Note:</strong> Standalone within the Culture; structure is dual-timeline and the ending is famous for a reason."
    ])
  },
  213: {
    lane: "classic",
    pickDescription:
      "Whitehead’s reform-school novel based on the Dozier School: two boys, a lie, and the afterlife of Jim Crow. Pulitzer winner; short and severe.",
    whyIncluded: cites([
      '<strong>Award / modern classic:</strong> <a href="https://en.wikipedia.org/wiki/The_Nickel_Boys">Wikipedia: <em>The Nickel Boys</em></a> (Pulitzer Prize for Fiction, 2020).',
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Colson_Whitehead">Colson Whitehead</a>.'
    ])
  },
  233: {
    lane: "nonfiction",
    pickDescription:
      "Russell’s single-volume tour from the pre-Socratics through early 20th-century philosophy. Opinionated, readable, and a “great books” companion rather than a textbook.",
    whyIncluded: cites([
      '<strong>Canonical nonfiction:</strong> <a href="https://en.wikipedia.org/wiki/A_History_of_Western_Philosophy">Wikipedia: <em>A History of Western Philosophy</em></a> (1945; pre-1960).',
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Bertrand_Russell">Bertrand Russell</a> (Nobel Prize in Literature, 1950).'
    ])
  },
  84: {
    lane: "nonfiction",
    pickDescription:
      "Rhodes’s Pulitzer history of the bomb: physics, industrial scale, and the people who built it. Canonical science/history writing; long (37h) so it pairs well as the “expensive” half of a 2-for-1.",
    whyIncluded: cites([
      '<strong>Canonical science writing:</strong> <a href="https://en.wikipedia.org/wiki/The_Making_of_the_Atomic_Bomb">Wikipedia: <em>The Making of the Atomic Bomb</em></a> (Pulitzer Prize for General Nonfiction, 1988).',
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Richard_Rhodes">Richard Rhodes</a>.'
    ])
  },
  466: {
    lane: "nonfiction",
    pickDescription:
      "Volume 2 of Solzhenitsyn’s documentary epic of the Soviet camp system. Canonical political nonfiction; this is not volume 1—only grab it if you already own or want the set.",
    whyIncluded: cites([
      '<strong>Canonical nonfiction:</strong> <a href="https://en.wikipedia.org/wiki/The_Gulag_Archipelago">Wikipedia: <em>The Gulag Archipelago</em></a> (1973–75).',
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Aleksandr_Solzhenitsyn">Aleksandr Solzhenitsyn</a> (Nobel Prize in Literature, 1970).'
    ])
  },
  201: {
    lane: "nonfiction",
    pickDescription:
      "Volume 3 of the same work. Same caveat as volume 2: not the starting point.",
    whyIncluded: cites([
      '<strong>See:</strong> <a href="https://en.wikipedia.org/wiki/The_Gulag_Archipelago">Wikipedia: <em>The Gulag Archipelago</em></a>.',
      "<strong>Reason:</strong> Included because both later volumes are in the sale; skip unless you are collecting the set."
    ])
  },
  441: {
    lane: "renowned SFF",
    pickDescription:
      "KSR generation-starship novel: ecology, engineering, and what “home” means when Earth is a rumor. Hard-SF with literary patience; often ranked among his best after the Mars trilogy.",
    whyIncluded: cites([
      '<strong>Renowned SFF:</strong> <a href="https://en.wikipedia.org/wiki/Aurora_(novel)">Wikipedia: <em>Aurora</em></a> (2015).',
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Kim_Stanley_Robinson">Kim Stanley Robinson</a>.'
    ])
  },
  423: {
    lane: "renowned SFF",
    pickDescription:
      "Literary fantasy: a schoolmaster climbs the Tower of Babel, a city that is also a vertical world. Book 1 of the Books of Babel; frequently recommended to readers who want weird architecture more than chosen-one plots.",
    whyIncluded: cites([
      '<strong>Renowned SFF / literary fantasy:</strong> <a href="https://en.wikipedia.org/wiki/Senlin_Ascends">Wikipedia: <em>Senlin Ascends</em></a>.',
      "<strong>Reason:</strong> Strong “classic signal” in contemporary fantasy recommendation lists; starting volume."
    ])
  },
  146: {
    lane: "renowned SFF",
    pickDescription:
      "Ken Liu’s silkpunk epic of rebellion and statecraft, loosely in conversation with the Chu–Han contention. Book 1 of the Dandelion Dynasty; Kramer narrates.",
    whyIncluded: cites([
      '<strong>Renowned SFF:</strong> <a href="https://en.wikipedia.org/wiki/The_Grace_of_Kings">Wikipedia: <em>The Grace of Kings</em></a> (2015).',
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Ken_Liu">Ken Liu</a> (Hugo/Nebula translator and writer).'
    ])
  },
  239: {
    lane: "renowned SFF",
    pickDescription:
      "Novella: 1920s Georgia, a war veteran, and Ku Klux Klan members who are also literal monsters. Compact (5h36m), vicious, and award-heavy.",
    whyIncluded: cites([
      '<strong>Award SFF:</strong> <a href="https://en.wikipedia.org/wiki/Ring_Shout_(novella)">Wikipedia: <em>Ring Shout</em></a> (British Fantasy, Locus, and World Fantasy awards).',
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/P._Dj%C3%A8l%C3%AD_Clark">P. Djèlí Clark</a>.'
    ])
  },
  28: {
    lane: "renowned SFF",
    pickDescription:
      "New series from the Expanse authors: humans captured by an alien empire and put to work on a world they do not understand. Jefferson Mays narrates. Book 1 of The Captive’s War.",
    whyIncluded: cites([
      '<strong>Renowned SFF authors:</strong> <a href="https://en.wikipedia.org/wiki/James_S.A._Corey">James S. A. Corey</a> (The Expanse).',
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Mercy_of_Gods">Wikipedia: <em>The Mercy of Gods</em></a> (2024).'
    ])
  },
  110: {
    lane: "renowned SFF",
    pickDescription:
      "Cairo djinn-politics fantasy: a con artist gets pulled into the hidden magical city. Book 1 of the Daevabad trilogy; a common “if you liked <em>The City of Brass</em>” gateway.",
    whyIncluded: cites([
      '<strong>Well-regarded SFF:</strong> <a href="https://en.wikipedia.org/wiki/The_City_of_Brass_(novel)">Wikipedia: <em>The City of Brass</em></a> (2017).',
      "<strong>Reason:</strong> Frequently recommended contemporary fantasy with a strong classic-signal (Locus finalist, big word-of-mouth)."
    ])
  },
  171: {
    lane: "wishlist / interest",
    pickDescription:
      "Gladwell’s essay collection (dogs, ketchup, hiring). You asked for “something by Malcolm Gladwell”; this is the one in the sale, and he reads it.",
    whyIncluded: cites([
      "<strong>Personal interest:</strong> “Something by Malcolm Gladwell” is on your list.",
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/What_the_Dog_Saw">Wikipedia: <em>What the Dog Saw</em></a> (2009).'
    ])
  },
  158: {
    lane: "nonfiction",
    pickDescription:
      "hooks on love, patriarchy, and how men are taught to refuse intimacy. Cultural criticism from a major theorist; short enough to pair with a long novel.",
    whyIncluded: cites([
      '<strong>Influential cultural criticism:</strong> <a href="https://en.wikipedia.org/wiki/Bell_hooks">Wikipedia: bell hooks</a>.',
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/All_About_Love_(book)">Related hooks love trilogy context</a> (<em>Communion</em>, 2002).'
    ])
  },
  325: {
    lane: "wishlist / interest",
    pickDescription:
      "Verghese’s memoir of a tennis friendship wrecked by addiction. Wishlist author (<em>The Covenant of Water</em>); this is earlier, personal, and not the big novel.",
    whyIncluded: cites([
      "<strong>Audible wishlist author:</strong> Abraham Verghese.",
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Abraham_Verghese">Wikipedia: Abraham Verghese</a>.'
    ])
  },
  34: {
    lane: "wishlist / interest",
    pickDescription:
      "Every Miss Marple short story in one set, read by Juliet Stevenson. Wishlist author; better as a dip-in collection than a single-plot novel.",
    whyIncluded: cites([
      "<strong>Audible wishlist author:</strong> Agatha Christie.",
      '<strong>Canon:</strong> <a href="https://en.wikipedia.org/wiki/Miss_Marple">Wikipedia: Miss Marple</a>.'
    ])
  },
  87: {
    lane: "nonfiction",
    pickDescription:
      "Cline’s account of the Late Bronze Age collapse—climate, trade, and the fall of palaces around 1177 BCE. Influential popular archaeology; he reads the revised edition.",
    whyIncluded: cites([
      '<strong>Influential history:</strong> <a href="https://en.wikipedia.org/wiki/1177_B.C.:_The_Year_Civilization_Collapsed">Wikipedia: <em>1177 B.C.</em></a>.',
      "<strong>Reason:</strong> Canonical-adjacent ancient history for a general reader."
    ])
  },
  125: {
    lane: "nonfiction",
    pickDescription:
      "Tick-tock reconstruction of Chernobyl: operators, design flaws, and the Soviet system. Pulitzer finalist; one of the best narrative-science disaster books of the last decade.",
    whyIncluded: cites([
      '<strong>Major science/history writing:</strong> <a href="https://en.wikipedia.org/wiki/Midnight_in_Chernobyl">Wikipedia: <em>Midnight in Chernobyl</em></a> (2019; Pulitzer finalist).'
    ])
  },
  312: {
    lane: "nonfiction",
    pickDescription:
      "Blight’s Pulitzer biography of Douglass: slavery, oratory, and Reconstruction. Long (37h) canonical American history.",
    whyIncluded: cites([
      '<strong>Pulitzer biography:</strong> <a href="https://en.wikipedia.org/wiki/Frederick_Douglass:_Prophet_of_Freedom">Wikipedia: <em>Frederick Douglass: Prophet of Freedom</em></a> (2018).',
      '<strong>Subject:</strong> <a href="https://en.wikipedia.org/wiki/Frederick_Douglass">Frederick Douglass</a>.'
    ])
  },
  482: {
    lane: "nonfiction",
    pickDescription:
      "Putnam’s sociology of collapsing American civic life—clubs, unions, trust. Revised edition of a book that still shapes how people talk about loneliness and institutions.",
    whyIncluded: cites([
      '<strong>Canonical social science:</strong> <a href="https://en.wikipedia.org/wiki/Bowling_Alone">Wikipedia: <em>Bowling Alone</em></a> (2000; this is the revised edition).'
    ])
  },
  432: {
    lane: "classic",
    pickDescription:
      "Le Carré’s most autobiographical spy novel: a double agent, a father, and the making of a liar. Often ranked with <em>Tinker Tailor</em> as his peak.",
    whyIncluded: cites([
      '<strong>Modern classic (spy fiction):</strong> <a href="https://en.wikipedia.org/wiki/A_Perfect_Spy">Wikipedia: <em>A Perfect Spy</em></a> (1986).',
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/John_le_Carr%C3%A9">John le Carré</a>.'
    ])
  },
  453: {
    lane: "renowned SFF",
    pickDescription:
      "Stephenson on geoengineering: a Texas bounce-house of climate politics and a giant gun that shoots sulfur into the sky. Ballerini narrates. Later, looser Stephenson—not <em>Snow Crash</em> / Baroque Cycle density.",
    whyIncluded: cites([
      '<strong>Major SFF author:</strong> <a href="https://en.wikipedia.org/wiki/Neal_Stephenson">Neal Stephenson</a> (previous 2-for-1 picks included <em>Snow Crash</em> and the Baroque Cycle).',
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/Termination_Shock">Wikipedia: <em>Termination Shock</em></a> (2021).'
    ])
  },
  459: {
    lane: "classic",
    pickDescription:
      "McDowell’s 1980s Southern gothic serial, here as one complete saga (~30h): a river family, a town, and something in the water. Cult horror with real literary reputation (he also wrote for Tim Burton).",
    whyIncluded: cites([
      '<strong>Cult classic:</strong> <a href="https://en.wikipedia.org/wiki/Blackwater_(serial_novel)">Wikipedia: <em>Blackwater</em></a> (1983).',
      '<strong>Author:</strong> <a href="https://en.wikipedia.org/wiki/Michael_McDowell_(author)">Michael McDowell</a>.'
    ])
  },
  401: {
    lane: "wishlist / interest",
    pickDescription:
      "Poppy War book 2. Kuang is on your Amazon wishlist for <em>Babel</em>. Only useful if you already finished <em>The Poppy War</em>; otherwise skip.",
    whyIncluded: cites([
      "<strong>Amazon wishlist author:</strong> R. F. Kuang.",
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Dragon_Republic">Wikipedia: <em>The Dragon Republic</em></a>.',
      "<strong>Note:</strong> Middle volume of a trilogy."
    ])
  },
  268: {
    lane: "wishlist / interest",
    pickDescription:
      "Poppy War book 3. Same rule as book 2: all-works for Kuang, but not a starting point.",
    whyIncluded: cites([
      "<strong>Amazon wishlist author:</strong> R. F. Kuang (include all works present).",
      '<strong>Work:</strong> <a href="https://en.wikipedia.org/wiki/The_Burning_God">Wikipedia: <em>The Burning God</em></a>.'
    ])
  }
};

const SRC_JSON = path.join(root, "out/results-2026-08-24T23-54-07.json");
const OUT_HTML = path.join(root, "out/report-2026-08-24T23-54-07-classic-picks.html");
const OUT_JSON = path.join(root, "out/picks-2026-08-24T23-54-07.json");
const SHELL_HTML = path.join(root, "out/report-2026-05-05T11-40-24-classic-picks.html");

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
  row.lane = extra.lane;
  row.pickDescription = extra.pickDescription;
  row.whyIncluded = extra.whyIncluded;
  return row;
});

const outPayload = {
  meta: {
    ...payload.meta,
    count: enrichedResults.length,
    subtitle: "2026-08-24 — Audible 2-for-1 picks (wishlist / classics / renowned SFF)",
    sourceResults: "results-2026-08-24T23-54-07.json",
    pickItemNumbers: PICK_ORDER,
    saleUrl: "https://www.audible.com/special-promo/2for1"
  },
  results: enrichedResults
};

fs.writeFileSync(OUT_JSON, JSON.stringify(outPayload, null, 2));

let html = fs.readFileSync(SHELL_HTML, "utf8");
html = html.replace(
  /<title>.*?<\/title>/,
  "<title>Unpaginate report — 2026-08-24 2-for-1 picks</title>"
);
html = html.replace(
  /<h1>.*?<\/h1>/,
  "<h1>Unpaginate report — 2026-08-24 2-for-1 picks</h1>"
);
html = html.replace(
  /<p class="meta">\s*Curated subset[\s\S]*?<\/p>/,
  `<p class="meta">
    Curated subset ·
    Count: ${outPayload.meta.count} ·
    Source: <code>${outPayload.meta.sourceResults}</code> ·
    Generated: ${new Date().toISOString()}
  </p>`
);
html = html.replace(
  /<script type="application\/json" id="unpaginate-data">[\s\S]*?<\/script>/,
  `<script type="application/json" id="unpaginate-data">${JSON.stringify(outPayload).replace(/</g, "\\u003c")}</script>`
);

fs.writeFileSync(OUT_HTML, html, "utf8");
console.log("Wrote", OUT_JSON);
console.log("Wrote", OUT_HTML);
