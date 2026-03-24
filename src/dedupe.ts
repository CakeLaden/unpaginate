import { createHash } from "node:crypto";
import type { ResultRow } from "./types.js";

export function dedupeKey(
  row: ResultRow,
  mode: "href" | "htmlHash"
): string {
  const data = Object.fromEntries(
    Object.entries(row).filter(([k]) => k !== "_meta")
  ) as Omit<ResultRow, "_meta">;
  if (mode === "htmlHash") {
    const html =
      typeof data.html === "string" ? data.html : JSON.stringify(data);
    return createHash("sha256").update(html).digest("hex");
  }
  for (const v of Object.values(data)) {
    if (typeof v === "string" && /^https?:\/\//i.test(v.trim())) {
      return v.trim().split("#")[0] ?? "";
    }
  }
  return createHash("sha256").update(JSON.stringify(data)).digest("hex");
}
