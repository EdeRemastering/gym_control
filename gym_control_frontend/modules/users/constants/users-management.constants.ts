import type { RoleDefinition, UsersFilters } from "@/modules/users/types/users-management.types";

export const DEFAULT_USERS_FILTERS: UsersFilters = {
  role: "all",
  branch: "all",
  status: "all",
  inactivity: "all",
  search: "",
};

export const SYSTEM_ROLES: RoleDefinition[] = [
  {
    id: "role-admin",
    name: "Administrador",
    description: "Acceso total al sistema",
    userCount: 8,
    color: "text-fuchsia-300",
    permissions: ["dashboard", "clients", "memberships", "finance", "reports", "alerts", "scheduling", "training", "users", "settings"],
  },
  {
    id: "role-trainer",
    name: "Entrenador",
    description: "Entrena y gestiona rutinas",
    userCount: 12,
    color: "text-cyan-300",
    permissions: ["dashboard", "clients", "training", "scheduling", "alerts"],
  },
  {
    id: "role-reception",
    name: "Recepcionista",
    description: "Atención y gestión de clientes",
    userCount: 7,
    color: "text-amber-300",
    permissions: ["dashboard", "clients", "memberships", "alerts", "scheduling"],
  },
  {
    id: "role-finance",
    name: "Finanzas",
    description: "Pagos y reportes financieros",
    userCount: 4,
    color: "text-emerald-300",
    permissions: ["dashboard", "finance", "reports", "alerts"],
  },
];
