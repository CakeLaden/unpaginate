#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { backfillItemNumbersInOutDir } from "./backfill.js";
import { runUnpaginate } from "./run.js";
import { writeOutputs } from "./report.js";

function parseArgs(argv: string[]): {
  command: string;
  config?: string;
  outDir: string;
  headed: boolean;
  storageState?: string;
  fixedNames: boolean;
} {
  const out: {
    command: string;
    config?: string;
    outDir: string;
    headed: boolean;
    storageState?: string;
    fixedNames: boolean;
  } = {
    command: argv[0] ?? "",
    outDir: "./out",
    headed: false,
    fixedNames: false
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--config" && argv[i + 1]) {
      out.config = argv[++i];
    } else if (a === "--out-dir" && argv[i + 1]) {
      out.outDir = argv[++i];
    } else if (a === "--headed") {
      out.headed = true;
    } else if (a === "--storage-state" && argv[i + 1]) {
      out.storageState = argv[++i];
    } else if (a === "--fixed-names") {
      out.fixedNames = true;
    }
  }
  return out;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const parsed = parseArgs(argv);

  if (parsed.command === "backfill-item-numbers") {
    const outDir = resolve(process.cwd(), parsed.outDir);
    const { jsonFiles } = await backfillItemNumbersInOutDir(outDir);
    console.log(`Updated ${jsonFiles} result file(s) in ${outDir}`);
    return;
  }

  if (parsed.command !== "run" || !parsed.config) {
    console.error(
      "Usage: unpaginate run --config <file.json> [--out-dir <dir>] [--headed] [--storage-state <auth.json>] [--fixed-names]\n" +
        "       unpaginate backfill-item-numbers [--out-dir <dir>]"
    );
    process.exit(1);
  }

  const configPath = resolve(process.cwd(), parsed.config);
  let storageStatePath: string | undefined;
  if (parsed.storageState) {
    storageStatePath = resolve(process.cwd(), parsed.storageState);
    if (!existsSync(storageStatePath)) {
      console.error(
        `Storage state file not found: ${storageStatePath}\n` +
          "Create it once after signing in, e.g.:\n" +
          "  npx playwright codegen https://www.audible.com --save-storage=auth.json\n" +
          "Or omit --storage-state (Audible will usually require login in the browser)."
      );
      process.exit(1);
    }
  }

  const raw = JSON.parse(await readFile(configPath, "utf8"));
  const { results, stoppedReason } = await runUnpaginate(raw, {
    headed: parsed.headed,
    storageStatePath
  });

  const outDir = resolve(process.cwd(), parsed.outDir);
  const { jsonPath, htmlPath } = await writeOutputs(outDir, results, {
    stoppedReason,
    fixedNames: parsed.fixedNames
  });

  console.log(`Stopped: ${stoppedReason}`);
  console.log(`Wrote ${results.length} rows`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`HTML: ${htmlPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
