"use client";

import { useMemo } from "react";
import { InsightsGlassPanel } from "@/modules/insights/components/insights-glass-panel";
import { buildSparklinePath } from "@/modules/insights/lib/sparkline-path";
import { useAnalyticsFlowStore } from "@/modules/insights/store/use-analytics-flow-store";

/** Vista compacta de tendencia de ingresos (derivada del flujo principal). */
export function RevenueTrendChart() {
  const series = useAnalyticsFlowStore((s) => s.series);
  const values = useMemo(() => series.map((p) => p.revenue), [series]);
  const path = useMemo(() => buildSparklinePath(values, 200, 48), [values]);
  const last = values[values.length - 1];
  const first = values[0] ?? 0;
  const delta = first > 0 ? Math.round(((last - first) / first) * 1000) / 10 : 0;

  return (
    <InsightsGlassPanel className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Tendencia ingresos</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold text-white">${(last ?? 0).toLocaleString("es-MX")}</p>
          <p className={`text-xs font-medium ${delta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}% en periodo
          </p>
        </div>
        <svg viewBox="0 0 200 48" className="h-12 w-40 shrink-0" aria-hidden>
          <path d={path} fill="none" stroke="rgba(34,211,238,0.9)" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </InsightsGlassPanel>
  );
}
