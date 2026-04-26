"use client";

import { Telescope } from "lucide-react";
import { ChurnPredictionCard } from "@/modules/insights/components/churn-prediction-card";
import { InsightsGlassPanel } from "@/modules/insights/components/insights-glass-panel";
import { LtvPredictionCard } from "@/modules/insights/components/ltv-prediction-card";
import { RevenueForecastCard } from "@/modules/insights/components/revenue-forecast-card";
import { usePredictionsStore } from "@/modules/insights/store/use-predictions-store";

export function PredictionsPanel() {
  const metrics = usePredictionsStore((s) => s.metrics);
  const branches = usePredictionsStore((s) => s.branchForecasts);

  const byId = (id: string) => metrics.find((m) => m.id === id);

  return (
    <InsightsGlassPanel className="p-4 md:p-5">
      <div className="flex items-center gap-2">
        <Telescope className="h-4 w-4 text-cyan-300" aria-hidden />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Horizonte 30 días</p>
          <h3 className="text-lg font-semibold text-white">Predicciones inteligentes</h3>
        </div>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">Modelo combinado: series financieras + señales de uso.</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {byId("rev") ? <RevenueForecastCard metric={byId("rev")!} index={0} /> : null}
        {byId("newc") ? <RevenueForecastCard metric={byId("newc")!} index={1} /> : null}
        {byId("churnp") ? <ChurnPredictionCard metric={byId("churnp")!} index={2} /> : null}
        {byId("ticket") ? <LtvPredictionCard metric={byId("ticket")!} index={3} /> : null}
        {byId("canc_prob") ? <ChurnPredictionCard metric={byId("canc_prob")!} index={4} /> : null}
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/25 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Forecast por sede</p>
        <ul className="mt-2 space-y-2 text-sm">
          {branches.map((b) => (
            <li key={b.branch} className="flex items-center justify-between gap-2 text-white/90">
              <span>{b.branch}</span>
              <span className="text-xs text-[var(--muted)]">
                ${b.revenue.toLocaleString("es-MX")}{" "}
                <span className="text-cyan-200/90">conf. {Math.round(b.confidence * 100)}%</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </InsightsGlassPanel>
  );
}
