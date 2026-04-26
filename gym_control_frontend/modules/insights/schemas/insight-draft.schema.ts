import { z } from "zod";

export const insightDraftSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres").max(120),
  detail: z.string().min(8, "Describe el contexto").max(2000),
  priority: z.enum(["critical", "high", "medium", "low"]),
  owner: z.string().min(2).max(80),
});

export type InsightDraftForm = z.infer<typeof insightDraftSchema>;
