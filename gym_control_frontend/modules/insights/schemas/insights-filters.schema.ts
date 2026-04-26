import { z } from "zod";

export const insightsDatePresetSchema = z.enum(["7d", "30d", "90d"]);

export const insightsFiltersSchema = z.object({
  datePreset: insightsDatePresetSchema,
  branchId: z.string().min(1),
  planSegment: z.enum(["all", "premium", "enterprise", "basic", "corporate"]),
});

export type InsightsFiltersForm = z.infer<typeof insightsFiltersSchema>;
