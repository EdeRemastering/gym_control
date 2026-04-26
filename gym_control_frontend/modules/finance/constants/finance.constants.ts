import type { BranchPerformanceRow, FinanceFilters, FinanceInsight, FunnelStage } from "@/modules/finance/types/finance.types";

export const DEFAULT_FINANCE_FILTERS: FinanceFilters = {
  branch: "all",
  datePreset: "30d",
};

export const DEFAULT_FUNNEL: FunnelStage[] = [
  { id: "visits", label: "Visitas / Leads", count: 1980, widthPct: 100 },
  { id: "trials", label: "Trials iniciados", count: 872, widthPct: 72 },
  { id: "active", label: "Trials activos", count: 598, widthPct: 52 },
  { id: "paid", label: "Convertidos a pago", count: 382, widthPct: 36 },
  { id: "churn", label: "Cancelaciones", count: 23, widthPct: 12 },
];

export const DEFAULT_INSIGHTS: FinanceInsight[] = [
  {
    id: "1",
    title: "Churn subió 0.6% esta semana",
    description: "Revisa membresías premium en sede Sur.",
    cta: "Ver análisis",
  },
  {
    id: "2",
    title: "12 pagos fallidos requieren atención",
    description: "Reintentos automáticos desactivados para 4 clientes.",
    cta: "Revisar fallidos",
  },
  {
    id: "3",
    title: "Oportunidad de upgrade",
    description: "32 clientes en plan Basic con alta asistencia.",
    cta: "Ver lista",
  },
  {
    id: "4",
    title: "Mejor LTV: Sede Norte",
    description: "+18% vs trimestre anterior en ingresos recurrentes.",
    cta: "Ver sede",
  },
];

export const BRANCH_PERFORMANCE_MOCK: BranchPerformanceRow[] = [
  {
    branch: "Sede Centro",
    income: "$48,200",
    variation: "+12%",
    clients: 520,
    newClients: 42,
    churn: "2.1%",
    arpu: "$92",
    performance: "excelente" as const,
  },
  {
    branch: "Sede Norte",
    income: "$52,900",
    variation: "+18%",
    clients: 410,
    newClients: 38,
    churn: "1.8%",
    arpu: "$105",
    performance: "excelente" as const,
  },
  {
    branch: "Sede Sur",
    income: "$23,480",
    variation: "-4%",
    clients: 318,
    newClients: 18,
    churn: "5.2%",
    arpu: "$74",
    performance: "riesgo" as const,
  },
];
