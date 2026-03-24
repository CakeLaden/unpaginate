import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  assignItemNumbers,
  buildReportHtml,
  type ResultsFilePayload
} from "./report.js";

/**
 * Adds `itemNumber` (1-based) to each result, updates `meta.count`, and
 * rewrites matching `report*.html` when present.
 */
export async function backfillItemNumbersInOutDir(outDir: string): Promise<{
  jsonFiles: number;
}> {
  const files = await readdir(outDir);
  const jsonFiles = files.filter((f) => /^results.*\.json$/.test(f));
  let n = 0;
  for (const f of jsonFiles) {
    const path = join(outDir, f);
    const parsed = JSON.parse(await readFile(path, "utf8")) as Partial<ResultsFilePayload>;
    if (!Array.isArray(parsed.results)) {
      continue;
    }
    const raw: ResultsFilePayload = {
      meta: parsed.meta ?? {
        stoppedReason: "unknown",
        generatedAt: new Date().toISOString(),
        count: parsed.results.length
      },
      results: assignItemNumbers(parsed.results)
    };
    raw.meta.count = raw.results.length;
    await writeFile(path, JSON.stringify(raw, null, 2), "utf8");
    const stampMatch = f.match(/^results(?:-(.+))?\.json$/);
    const stamp = stampMatch?.[1];
    const htmlName = stamp ? `report-${stamp}.html` : "report.html";
    const htmlPath = join(outDir, htmlName);
    await writeFile(htmlPath, buildReportHtml(raw), "utf8");
    n++;
  }
  return { jsonFiles: n };
}
