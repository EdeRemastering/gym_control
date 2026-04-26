import type { InsightsDatePreset, ReportDefinition } from "@/modules/insights/types/insights.types";

export const INSIGHTS_DATE_PRESETS: { value: InsightsDatePreset; label: string }[] = [
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "90d", label: "90 días" },
];

export const INSIGHTS_BRANCH_OPTIONS = [
  { value: "all", label: "Todas las sedes" },
  { value: "norte", label: "Sede Norte" },
  { value: "centro", label: "Sede Centro" },
  { value: "sur", label: "Sede Sur" },
] as const;

export const INSIGHTS_PLAN_SEGMENTS = [
  { value: "all", label: "Todos los planes" },
  { value: "premium", label: "Premium" },
  { value: "enterprise", label: "Enterprise" },
  { value: "basic", label: "Basic" },
  { value: "corporate", label: "Corporate" },
] as const;

export const INSIGHTS_REPORTS: ReportDefinition[] = [
  {
    id: "financial",
    title: "Reporte financiero",
    description: "Márgenes, MRR y flujo de caja operativo.",
    accent: "violet",
  },
  {
    id: "retention",
    title: "Reporte de retención",
    description: "Cohortes, reenganche y hábitos de asistencia.",
    accent: "success",
  },
  {
    id: "clients",
    title: "Reporte de clientes",
    description: "Segmentación, salud y oportunidades de upsell.",
    accent: "info",
  },
  {
    id: "payments",
    title: "Reporte de pagos",
    description: "Éxito de cobro, reintentos y contracargos.",
    accent: "warning",
  },
  {
    id: "branch",
    title: "Reporte por sede",
    description: "Comparativa multi-sede con benchmarks internos.",
    accent: "danger",
  },
  {
    id: "churn",
    title: "Reporte de churn",
    description: "Señales tempranas y riesgo de cancelación.",
    accent: "danger",
  },
  {
    id: "executive_forecast",
    title: "Forecast ejecutivo",
    description: "Proyección 30/60/90 con escenarios base y stress.",
    accent: "violet",
  },
];
