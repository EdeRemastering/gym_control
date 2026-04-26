import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(2, "Nombre requerido").max(80),
  duration: z.number().min(1, "Mín. 1 día").max(3650),
  price: z.number().min(0, "Precio inválido"),
});

export const editPlanSchema = createPlanSchema.extend({
  planId: z.string().min(1),
});

export const registerPaymentSchema = z.object({
  userId: z.string().min(1, "Selecciona un usuario"),
  amount: z.number().positive("Monto debe ser mayor a 0"),
  method: z.enum(["CARD", "CASH", "TRANSFER", "ONLINE"]),
});

export type CreatePlanForm = z.infer<typeof createPlanSchema>;
export type EditPlanForm = z.infer<typeof editPlanSchema>;
export type RegisterPaymentForm = z.infer<typeof registerPaymentSchema>;
