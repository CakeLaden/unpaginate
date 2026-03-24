import { z } from "zod";

const extractRuleSchema = z.union([
  z.string().min(1),
  z.object({
    selector: z.string().min(1),
    type: z.enum(["text", "html", "attr", "image"]),
    attr: z.string().optional()
  })
]);

const paginationNextLinkSchema = z.object({
  type: z.literal("nextLink"),
  selector: z.string().min(1),
  disabledSelector: z.string().optional()
});

const paginationParamIncrementSchema = z.object({
  type: z.literal("paramIncrement"),
  param: z.string().min(1),
  start: z.number().int().optional(),
  step: z.number().int().optional()
});

const paginationUrlTemplateSchema = z.object({
  type: z.literal("urlTemplate"),
  template: z.string().min(1),
  startPage: z.number().int().optional(),
  step: z.number().int().optional()
});

const paginationSchema = z.discriminatedUnion("type", [
  paginationNextLinkSchema,
  paginationParamIncrementSchema,
  paginationUrlTemplateSchema
]);

export const unpaginateConfigSchema = z.object({
  startUrl: z.string().url(),
  itemSelector: z.string().min(1),
  extract: z.record(z.string(), extractRuleSchema).optional(),
  pagination: paginationSchema,
  maxPages: z.number().int().positive().optional(),
  maxItems: z.number().int().positive().optional(),
  delayMs: z.number().int().nonnegative().optional(),
  emptyPagesBeforeStop: z.number().int().positive().optional(),
  dedupeBy: z.enum(["href", "htmlHash"]).optional(),
  navigationTimeoutMs: z.number().int().positive().optional(),
  waitForItemTimeoutMs: z.number().int().positive().optional()
});

export type ExtractRule = z.infer<typeof extractRuleSchema>;
export type PaginationConfig = z.infer<typeof paginationSchema>;
export type UnpaginateConfig = z.infer<typeof unpaginateConfigSchema>;

export type ResultMeta = {
  pageUrl: string;
  pageIndex: number;
};

export type ResultRow = Record<string, unknown> & {
  _meta: ResultMeta;
};
