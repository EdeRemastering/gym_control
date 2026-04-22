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
  dashboard: "Centro de control",
  billing: "Flujo financiero",
  training: "Entrenamiento en vivo",
  scheduling: "Agenda inteligente",
  users: "Usuarios y roles",
  analytics: "Laboratorio de insights",
  profile: "Perfil dinámico",
  social: "Área social",
  notifications: "Centro de alertas",
};
