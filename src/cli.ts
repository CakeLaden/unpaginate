#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runUnpaginate } from "./run.js";
import { writeOutputs } from "./report.js";

function parseArgs(argv: string[]): {
  command: string;
  config?: string;
  outDir: string;
  headed: boolean;
  storageState?: string;
} {
  const out: {
    command: string;
    config?: string;
    outDir: string;
    headed: boolean;
    storageState?: string;
  } = {
    command: argv[0] ?? "",
    outDir: "./out",
    headed: false
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
    }
  }
  return out;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const parsed = parseArgs(argv);
  if (parsed.command !== "run" || !parsed.config) {
    console.error(
      "Usage: unpaginate run --config <file.json> [--out-dir <dir>] [--headed] [--storage-state <auth.json>]"
    );
    process.exit(1);
  }

  const configPath = resolve(process.cwd(), parsed.config);
  const raw = JSON.parse(await readFile(configPath, "utf8"));
  const { results, stoppedReason } = await runUnpaginate(raw, {
    headed: parsed.headed,
    storageStatePath: parsed.storageState
      ? resolve(process.cwd(), parsed.storageState)
      : undefined
  });

  const outDir = resolve(process.cwd(), parsed.outDir);
  const { jsonPath, htmlPath } = await writeOutputs(outDir, results, {
    stoppedReason
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
