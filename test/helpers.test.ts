import { describe, expect, it } from "vitest";
import { fillUrlTemplate, nextParamUrl } from "../src/pagination/helpers.js";
import { nextUrlForTemplate } from "../src/pagination/resolveNext.js";
import { fingerprintPageContent } from "../src/fingerprint.js";

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
