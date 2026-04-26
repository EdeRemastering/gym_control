import type { Role } from "@/lib/types";

export type ModuleKey =
  | "dashboard"
  | "billing"
  | "training"
  | "scheduling"
  | "users"
  | "analytics"
  | "profile"
  | "social"
  | "notifications";

export const roleModules: Record<Role, ModuleKey[]> = {
  ADMIN: [
    "dashboard",
    "billing",
    "training",
    "scheduling",
    "users",
    "analytics",
    "profile",
    "social",
    "notifications",
  ],
  TRAINER: ["dashboard", "training", "scheduling", "users", "profile", "social", "notifications"],
  CLIENT: ["dashboard", "training", "billing", "profile", "social", "notifications"],
};

export const moduleLabels: Record<ModuleKey, string> = {
  dashboard: "Resumen del gimnasio",
  billing: "Pagos y cobros",
  training: "Entrenamientos",
  scheduling: "Agenda de clases",
  users: "Clientes y accesos",
  analytics: "Analisis del negocio",
  profile: "Mi perfil",
  social: "Comunidad",
  notifications: "Notificaciones",
};
