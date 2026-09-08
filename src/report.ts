import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ResultRow } from "./types.js";

export type ResultsFilePayload = {
  meta: {
    stoppedReason: string;
    generatedAt: string;
    count: number;
  };
  results: ResultRow[];
};

/** Local date/time safe for filenames, e.g. `2025-03-24T17-05-30`. */
export function formatOutputFileStamp(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}-${m}-${d}T${h}-${min}-${s}`;
}

export type WriteOutputsMeta = {
  stoppedReason: string;
  /**
   * Shared suffix for `results-<stamp>.json` and `report-<stamp>.html`.
   * Defaults to {@link formatOutputFileStamp} at write time.
   */
  fileStamp?: string;
  /** If true, write `results.json` and `report.html` (no datetime in names). */
  fixedNames?: boolean;
};

/** 1-based sequence for each row (for display and exports). */
export function assignItemNumbers(results: ResultRow[]): ResultRow[] {
  return results.map((row, i) => ({
    ...row,
    itemNumber: i + 1
  }));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Render table cells as <img> when the value is a likely image URL. */
export function shouldRenderCellAsImage(column: string, value: string): boolean {
  if (!value || typeof value !== "string") {
    return false;
  }
  const v = value.trim();
  if (!/^https?:\/\//i.test(v)) {
    return false;
  }
  let parsed: URL;
  try {
    parsed = new URL(v);
  } catch {
    return false;
  }
  const c = column.toLowerCase();
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
  const path = parsed.pathname;
  if (/\.(jpe?g|png|gif|webp|avif)$/i.test(path)) {
    return true;
  }
  if (/(m\.media-amazon|images-amazon|ssl-images-amazon)/i.test(parsed.hostname)) {
    return true;
  }
  return false;
}

const TABULATOR_VERSION = "6.3.1";

export function buildReportHtml(payload: ResultsFilePayload): string {
  const dataJson = JSON.stringify(payload).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Unpaginate report</title>
  <link rel="stylesheet" href="https://unpkg.com/tabulator-tables@${TABULATOR_VERSION}/dist/css/tabulator.min.css" />
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
  </style>
</head>
<body>
  <h1>Unpaginate report</h1>
  <p class="meta">
    Stopped: ${escapeHtml(payload.meta.stoppedReason)} ·
    Count: ${payload.meta.count} ·
    ${escapeHtml(payload.meta.generatedAt)}
  </p>
  <p class="meta" style="font-size: 13px;">Sort by clicking headers. Filter with inputs under headers. <strong>itemNumber</strong> accepts a comma-separated list (e.g. <code>1, 3, 300</code>); invalid tokens are ignored. Drag column headers to reorder. Use the page size control for long lists.</p>
  <p class="meta" id="unpaginate-review-toolbar" style="font-size: 13px;">
    <strong>Review:</strong>
    check <strong>Hide</strong> on a row to remove it from the table (session only; refresh restores everything).
    <button type="button" id="unpaginate-show-all-rows" style="margin-left: 0.5rem;">Show all hidden rows</button>
    <span id="unpaginate-hidden-count-wrap" style="margin-left: 0.35rem;">(<span id="unpaginate-hidden-count">0</span> hidden)</span>
  </p>
  <div id="grid"></div>
  <script type="application/json" id="unpaginate-data">${dataJson}</script>
  <script src="https://unpkg.com/tabulator-tables@${TABULATOR_VERSION}/dist/js/tabulator.min.js"></script>
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
      pageIndex: r._meta && r._meta.pageIndex,
      pageUrl: r._meta && r._meta.pageUrl
    };
    for (var k in r) {
      if (k === "_meta" || k === "itemNumber") continue;
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
    add("pageIndex");
    add("pageUrl");
    for (var i = 0; i < tableRows.length; i++) {
      var row = tableRows[i];
      for (var k in row) {
        if (k === "__rowUid") continue;
        if (k !== "itemNumber" && k !== "pageIndex" && k !== "pageUrl") {
          add(k);
        }
      }
    }
    return keys;
  }
  function parseItemNumberFilter(headerValue) {
    var wanted = [];
    var parts = String(headerValue || "").split(/[,\s]+/);
    for (var i = 0; i < parts.length; i++) {
      var t = parts[i].trim();
      if (!t) continue;
      var n = parseInt(t, 10);
      if (!isNaN(n)) wanted.push(n);
    }
    return wanted;
  }
  function cellFormatter(cell) {
    var v = cell.getValue();
    var col = cell.getField();
    if (v === null || v === undefined) return "";
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
      headerFilterPlaceholder: field === "itemNumber" ? "e.g. 1, 3, 300" : "Filter…",
      formatter: cellFormatter
    };
    if (field === "itemNumber") {
      def.headerFilterFunc = function (headerValue, rowValue, rowData, filterParams) {
        if (headerValue === "" || headerValue === null || headerValue === undefined) {
          return true;
        }
        var wanted = parseItemNumberFilter(headerValue);
        if (wanted.length === 0) {
          return true;
        }
        var rv = Number(rowValue);
        if (isNaN(rv)) {
          return false;
        }
        return wanted.indexOf(rv) !== -1;
      };
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
    pagination: true,
    paginationSize: 50,
    paginationSizeSelector: [25, 50, 100, 500],
    paginationCounter: "rows",
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
}

export async function writeOutputs(
  outDir: string,
  results: ResultRow[],
  meta: WriteOutputsMeta
): Promise<{ jsonPath: string; htmlPath: string }> {
  await mkdir(outDir, { recursive: true });
  const stamp =
    meta.fixedNames === true
      ? null
      : (meta.fileStamp ?? formatOutputFileStamp());
  const jsonName = stamp ? `results-${stamp}.json` : "results.json";
  const htmlName = stamp ? `report-${stamp}.html` : "report.html";
  const jsonPath = join(outDir, jsonName);
  const htmlPath = join(outDir, htmlName);

  const enriched = assignItemNumbers(results);
  const payload: ResultsFilePayload = {
    meta: {
      stoppedReason: meta.stoppedReason,
      generatedAt: new Date().toISOString(),
      count: enriched.length
    },
    results: enriched
  };

  await writeFile(jsonPath, JSON.stringify(payload, null, 2), "utf8");
  await writeFile(htmlPath, buildReportHtml(payload), "utf8");

  return { jsonPath, htmlPath };
}
