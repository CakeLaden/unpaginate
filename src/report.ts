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

function collectColumns(rows: ResultRow[]): string[] {
  const keys = new Set<string>();
  for (const row of rows) {
    for (const k of Object.keys(row)) {
      if (k !== "_meta" && k !== "itemNumber") {
        keys.add(k);
      }
    }
  }
  return [...keys].sort();
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

function formatCellHtml(column: string, value: unknown): string {
  if (value === undefined || value === null) {
    return "";
  }
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (shouldRenderCellAsImage(column, text)) {
    const src = escapeHtml(text);
    return `<div class="cell-image"><img src="${src}" alt="" loading="lazy" decoding="async" /></div><div class="cell-image-url"><a href="${src}" target="_blank" rel="noopener noreferrer">${src}</a></div>`;
  }
  return escapeHtml(text);
}

export function buildReportHtml(payload: ResultsFilePayload): string {
  const cols = collectColumns(payload.results);
  const dataJson = JSON.stringify(payload).replace(/</g, "\\u003c");
  const rowsHtml = payload.results
    .map((row, i) => {
      const itemNum =
        typeof row.itemNumber === "number" ? row.itemNumber : i + 1;
      const cells = cols
        .map((c) => {
          const v = row[c];
          return `<td>${formatCellHtml(c, v)}</td>`;
        })
        .join("");
      const meta = row._meta;
      return `<tr><td>${String(itemNum)}</td><td>${escapeHtml(String(meta.pageIndex))}</td><td>${escapeHtml(meta.pageUrl)}</td>${cells}</tr>`;
    })
    .join("\n");

  const header = [
    "<th>itemNumber</th>",
    "<th>pageIndex</th>",
    "<th>pageUrl</th>",
    ...cols.map((c) => `<th>${escapeHtml(c)}</th>`)
  ].join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Unpaginate report</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 1rem; }
    table { border-collapse: collapse; width: 100%; font-size: 14px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; vertical-align: top; }
    th { background: #f4f4f4; text-align: left; }
    .meta { color: #444; margin-bottom: 1rem; }
    pre.raw { white-space: pre-wrap; word-break: break-word; max-width: 40rem; }
    .cell-image img { max-height: 120px; max-width: 160px; object-fit: contain; vertical-align: middle; }
    .cell-image-url { font-size: 11px; margin-top: 4px; word-break: break-all; }
    .cell-image-url a { color: #06c; }
  </style>
</head>
<body>
  <h1>Unpaginate report</h1>
  <p class="meta">
    Stopped: ${escapeHtml(payload.meta.stoppedReason)} ·
    Count: ${payload.meta.count} ·
    ${escapeHtml(payload.meta.generatedAt)}
  </p>
  <table>
    <thead><tr>${header}</tr></thead>
    <tbody>
${rowsHtml}
    </tbody>
  </table>
  <script type="application/json" id="unpaginate-data">${dataJson}</script>
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
