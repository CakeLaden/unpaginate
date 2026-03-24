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
      if (k !== "_meta") {
        keys.add(k);
      }
    }
  }
  return [...keys].sort();
}

function buildReportHtml(payload: ResultsFilePayload): string {
  const cols = collectColumns(payload.results);
  const dataJson = JSON.stringify(payload).replace(/</g, "\\u003c");
  const rowsHtml = payload.results
    .map((row) => {
      const cells = cols
        .map((c) => {
          const v = row[c];
          const text =
            v === undefined || v === null
              ? ""
              : typeof v === "string"
                ? v
                : JSON.stringify(v);
          return `<td>${escapeHtml(text)}</td>`;
        })
        .join("");
      const meta = row._meta;
      return `<tr><td>${escapeHtml(String(meta.pageIndex))}</td><td>${escapeHtml(meta.pageUrl)}</td>${cells}</tr>`;
    })
    .join("\n");

  const header = [
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
  meta: { stoppedReason: string }
): Promise<{ jsonPath: string; htmlPath: string }> {
  await mkdir(outDir, { recursive: true });
  const jsonPath = join(outDir, "results.json");
  const htmlPath = join(outDir, "report.html");

  const payload: ResultsFilePayload = {
    meta: {
      stoppedReason: meta.stoppedReason,
      generatedAt: new Date().toISOString(),
      count: results.length
    },
    results
  };

  await writeFile(jsonPath, JSON.stringify(payload, null, 2), "utf8");
  await writeFile(htmlPath, buildReportHtml(payload), "utf8");

  return { jsonPath, htmlPath };
}
