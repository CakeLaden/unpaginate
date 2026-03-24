import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { runUnpaginate } from "../src/run.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("runUnpaginate", () => {
  it("aggregates items across nextLink pagination (file fixtures)", async () => {
    const startUrl = pathToFileURL(join(__dirname, "fixtures", "p1.html"))
      .href;
    const { results, stoppedReason } = await runUnpaginate({
      startUrl,
      itemSelector: ".item",
      pagination: { type: "nextLink", selector: ".next" },
      maxPages: 10
    });

    expect(stoppedReason).toBe("no_next_page");
    expect(results.map((r) => r.text)).toEqual(["Alpha", "Beta", "Gamma"]);
  });
});
