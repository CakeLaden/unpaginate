import { describe, expect, it } from "vitest";
import { fillUrlTemplate, nextParamUrl } from "../src/pagination/helpers.js";
import { nextUrlForTemplate } from "../src/pagination/resolveNext.js";
import { fingerprintPageContent } from "../src/fingerprint.js";
import type { ResultRow } from "../src/types.js";
import {
  assignItemNumbers,
  formatOutputFileStamp,
  shouldRenderCellAsImage
} from "../src/report.js";

describe("fillUrlTemplate", () => {
  it("replaces {page}", () => {
    expect(fillUrlTemplate("https://x.test?q={page}", 3)).toBe(
      "https://x.test?q=3"
    );
  });
});

describe("nextParamUrl", () => {
  it("adds param when missing using start as implicit page", () => {
    expect(nextParamUrl("https://x.test/a", "page", 1, 1)).toBe(
      "https://x.test/a?page=2"
    );
  });

  it("increments existing param", () => {
    expect(nextParamUrl("https://x.test/a?page=2", "page", 1, 1)).toBe(
      "https://x.test/a?page=3"
    );
  });
});

describe("nextUrlForTemplate", () => {
  it("uses pageIndex for next page number", () => {
    expect(
      nextUrlForTemplate("https://x.test/p/{page}", 0, 1, 1)
    ).toBe("https://x.test/p/2");
    expect(
      nextUrlForTemplate("https://x.test/p/{page}", 1, 1, 1)
    ).toBe("https://x.test/p/3");
  });
});

describe("assignItemNumbers", () => {
  it("adds 1-based itemNumber", () => {
    const rows = assignItemNumbers([
      { _meta: { pageUrl: "a", pageIndex: 0 }, x: 1 },
      { _meta: { pageUrl: "b", pageIndex: 1 }, x: 2 }
    ] as ResultRow[]);
    expect(rows[0].itemNumber).toBe(1);
    expect(rows[1].itemNumber).toBe(2);
  });
});

describe("formatOutputFileStamp", () => {
  it("matches expected pattern (local time)", () => {
    const d = new Date(2025, 2, 24, 17, 5, 30);
    const s = formatOutputFileStamp(d);
    expect(s).toBe("2025-03-24T17-05-30");
  });
});

describe("shouldRenderCellAsImage", () => {
  it("renders known column names with https URLs", () => {
    expect(
      shouldRenderCellAsImage(
        "thumbnail",
        "https://example.com/x.jpg?size=1"
      )
    ).toBe(true);
  });

  it("renders by file extension", () => {
    expect(
      shouldRenderCellAsImage(
        "photo",
        "https://cdn.example.com/a/b/c.webp"
      )
    ).toBe(true);
  });

  it("does not treat non-image URLs as images for arbitrary columns", () => {
    expect(
      shouldRenderCellAsImage(
        "href",
        "https://www.audible.com/pd/Foo-Audiobook/B00"
      )
    ).toBe(false);
  });
});

describe("fingerprintPageContent", () => {
  it("is stable for identical input", () => {
    const a = fingerprintPageContent("<html></html>");
    const b = fingerprintPageContent("<html></html>");
    expect(a).toBe(b);
  });

  it("differs when content differs", () => {
    const a = fingerprintPageContent("<html>a</html>");
    const b = fingerprintPageContent("<html>b</html>");
    expect(a).not.toBe(b);
  });
});
