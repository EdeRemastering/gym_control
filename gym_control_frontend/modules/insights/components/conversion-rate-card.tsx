"use client";

import { useInsightsKpiStore } from "@/modules/insights/store/use-insights-kpi-store";
import { selectKpiById } from "@/modules/insights/selectors/insights.selectors";
import { InsightsKpiSurface } from "@/modules/insights/components/insights-kpi-surface";

export function ConversionRateCard() {
  const kpis = useInsightsKpiStore((s) => s.kpis);
  const metric = selectKpiById(kpis, "trial_conversion");
  if (!metric) return null;
  return <InsightsKpiSurface metric={metric} index={4} />;
}
