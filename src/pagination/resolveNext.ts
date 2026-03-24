import type { Page } from "playwright";
import type { UnpaginateConfig } from "../types.js";
import { fillUrlTemplate, nextParamUrl } from "./helpers.js";

export type NextAction =
  | { kind: "goto"; url: string }
  | { kind: "click"; selector: string }
  | { kind: "done" };

export function nextUrlForParamIncrement(
  currentUrl: string,
  param: string,
  step: number,
  start: number
): string {
  return nextParamUrl(currentUrl, param, step, start);
}

export function nextUrlForTemplate(
  template: string,
  pageIndex: number,
  startPage: number,
  step: number
): string {
  const nextPageNum = startPage + (pageIndex + 1) * step;
  return fillUrlTemplate(template, nextPageNum);
}

export async function resolveNextLinkAction(
  page: Page,
  config: Extract<UnpaginateConfig["pagination"], { type: "nextLink" }>
): Promise<NextAction> {
  const el = await page.$(config.selector);
  if (!el) {
    return { kind: "done" };
  }
  try {
    if (config.disabledSelector) {
      const disabled = await el.evaluate(
        (node, sel: string) => {
          const d = node.closest(sel) ?? (node as Element).querySelector(sel);
          return !!d;
        },
        config.disabledSelector
      );
      if (disabled) {
        return { kind: "done" };
      }
    }
    const href = await el.evaluate((node: Element) => {
      const a = node.closest("a") ?? (node.tagName === "A" ? node : null);
      return a ? (a as HTMLAnchorElement).getAttribute("href") : null;
    });
    if (
      href &&
      href !== "#" &&
      !href.toLowerCase().startsWith("javascript:")
    ) {
      const resolved = new URL(href, page.url()).href;
      return { kind: "goto", url: resolved };
    }
    return { kind: "click", selector: config.selector };
  } finally {
    await el.dispose();
  }
}
