import type { LucideIcon } from "lucide-react";

export type FinanceBranchFilter = "all" | "centro" | "norte" | "sur";

export interface FinanceFilters {
  branch: FinanceBranchFilter;
  datePreset: "7d" | "30d" | "90d";
}

export interface FinanceKpi {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  icon: LucideIcon;
  tone: string;
}

export interface FunnelStage {
  id: string;
  label: string;
  count: number;
  widthPct: number;
}

export interface TransactionRow {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  status: string;
  at: string;
}

export interface FinanceInsight {
  id: string;
  title: string;
  description: string;
  cta: string;
}

export interface BranchPerformanceRow {
  branch: string;
  income: string;
  variation: string;
  clients: number;
  newClients: number;
  churn: string;
  arpu: string;
  performance: "excelente" | "bueno" | "riesgo";
}

