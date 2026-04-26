import type { AlertFilters } from "@/modules/notifications/types/alerts.types";

export const DEFAULT_ALERT_FILTERS: AlertFilters = {
  dateRange: "7d",
  priority: "all",
  scope: "all",
  branch: "all",
  owner: "all",
  status: "all",
  search: "",
};

export const ALERT_PRIORITY_LABEL: Record<AlertFilters["priority"], string> = {
  all: "Todas",
  critical: "Críticas",
  important: "Importantes",
  informative: "Informativas",
  completed: "Completadas",
};

export const ALERT_SCOPE_LABEL: Record<AlertFilters["scope"], string> = {
  all: "Todos",
  payment: "Pago",
  attendance: "Asistencia",
  system: "Sistema",
  training: "Entrenamiento",
  reminder: "Recordatorio",
};

export const ALERT_STATUS_LABEL: Record<AlertFilters["status"], string> = {
  all: "Todos",
  pending: "Pendiente",
  in_review: "En revisión",
  completed: "Completado",
};
