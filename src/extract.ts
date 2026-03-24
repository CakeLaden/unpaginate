import type { ExtractRule } from "./types.js";

export type ExtractMap = Record<string, ExtractRule> | undefined;

function ruleToNormalized(rule: ExtractRule): {
  selector: string;
  kind: "text" | "html" | "attr";
  attr?: string;
} {
  if (typeof rule === "string") {
    return { selector: rule, kind: "text" };
  }
  return {
    selector: rule.selector,
    kind: rule.type,
    attr: rule.attr
  };
}

export async function extractItemFields(
  el: import("playwright").ElementHandle<Element>,
  extract: ExtractMap
): Promise<Record<string, string>> {
  if (!extract || Object.keys(extract).length === 0) {
    const outer = await el.evaluate((node) => node.outerHTML ?? "");
    const text = await el.evaluate((node) => node.textContent?.trim() ?? "");
    return { html: outer, text };
  }

  const out: Record<string, string> = {};
  for (const [key, rule] of Object.entries(extract)) {
    const norm = ruleToNormalized(rule);
    const handle = await el.$(norm.selector);
    if (!handle) {
      out[key] = "";
      continue;
    }
    try {
      if (norm.kind === "text") {
        out[key] = (await handle.textContent())?.trim() ?? "";
      } else if (norm.kind === "html") {
        out[key] = await handle.evaluate((n) => n.outerHTML ?? "");
      } else {
        const name = norm.attr;
        if (!name) {
          out[key] = "";
        } else {
          out[key] = (await handle.getAttribute(name)) ?? "";
        }
      }
    } finally {
      await handle.dispose();
    }
  }
  return out;
}
