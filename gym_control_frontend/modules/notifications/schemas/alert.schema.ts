import { z } from "zod";

export const createAlertSchema = z.object({
  title: z.string().min(6, "El título debe tener al menos 6 caracteres").max(100, "Máximo 100 caracteres"),
  message: z.string().min(12, "Describe mejor la alerta").max(240, "Máximo 240 caracteres"),
  priority: z.enum(["critical", "important", "informative"]),
  scope: z.enum(["payment", "attendance", "system", "training", "reminder"]),
  owner: z.string().min(2, "Responsable requerido"),
  branch: z.string().min(2, "Sede requerida"),
});

export type CreateAlertFormData = z.infer<typeof createAlertSchema>;
