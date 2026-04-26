import type { KpiMetric } from "@/modules/insights/types/insights.types";

export function selectKpiById(kpis: KpiMetric[], id: string): KpiMetric | undefined {
  return kpis.find((k) => k.id === id);
}

export function formatDelta(deltaPct: number): string {
  const sign = deltaPct > 0 ? "↑" : deltaPct < 0 ? "↓" : "→";
  return `${sign} ${Math.abs(deltaPct).toFixed(1)}%`;
}

export function isPositiveGood(kpiId: string, deltaPct: number): boolean {
  if (kpiId === "churn") return deltaPct < 0;
  return deltaPct >= 0;
}
