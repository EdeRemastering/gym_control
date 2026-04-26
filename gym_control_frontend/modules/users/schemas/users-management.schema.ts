import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "Nombre requerido"),
  email: z.string().email("Correo inválido"),
  phone: z.string().min(8, "Teléfono inválido"),
  branch: z.string().min(2, "Sede requerida"),
  role: z.enum(["ADMIN", "TRAINER", "CLIENT"]),
});

export const createRoleSchema = z.object({
  name: z.string().min(3, "Nombre del rol requerido"),
  description: z.string().min(6, "Describe el alcance del rol"),
});

export const createPermissionSchema = z.object({
  resource: z.string().min(2, "Recurso requerido"),
  action: z.string().min(2, "Acción requerida"),
  scope: z.enum(["OWN", "GYM", "GLOBAL"]),
  name: z.string().min(3, "Nombre requerido"),
});

export type CreateUserForm = z.infer<typeof createUserSchema>;
export type CreateRoleForm = z.infer<typeof createRoleSchema>;
export type CreatePermissionForm = z.infer<typeof createPermissionSchema>;
