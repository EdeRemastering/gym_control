"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { InsightsGlassPanel } from "@/modules/insights/components/insights-glass-panel";
import { useAnalyticsFlowStore } from "@/modules/insights/store/use-analytics-flow-store";
import type { FlowSeriesPoint } from "@/modules/insights/types/insights.types";

const W = 560;
const H = 200;
const PAD = 16;

function buildPath(points: FlowSeriesPoint[], key: keyof Pick<FlowSeriesPoint, "revenue" | "payments" | "refunds">, maxY: number) {
  if (points.length === 0) return "";
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;
  const step = points.length > 1 ? innerW / (points.length - 1) : innerW;
  return points
    .map((p, i) => {
      const x = PAD + i * step;
      const v = p[key];
      const y = PAD + innerH - (v / maxY) * innerH;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function AnalyticsFlowChart() {
  const series = useAnalyticsFlowStore((s) => s.series);
  const setHighlight = useAnalyticsFlowStore((s) => s.setHighlightIndex);
  const [hover, setHover] = useState<number | null>(null);

  const maxY = useMemo(() => {
    let m = 1;
    for (const p of series) {
      m = Math.max(m, p.revenue, p.payments * 2.2, p.refunds * 8);
    }
    return m;
  }, [series]);

  const paths = useMemo(
    () => ({
      revenue: buildPath(series, "revenue", maxY),
      payments: buildPath(series, "payments", maxY),
      refunds: buildPath(series, "refunds", maxY),
    }),
    [maxY, series],
  );

  const active = hover ?? (series.length ? series.length - 1 : null);
  const activePoint = active !== null ? series[active] : null;

  return (
    <InsightsGlassPanel className="p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Analytics Flow</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Evolución de ingresos y métricas clave</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">Ingresos, pagos y reembolsos en la ventana seleccionada.</p>
        </div>
        {activePoint ? (
          <motion.div
            key={activePoint.date}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-xs text-white/90"
          >
            <p className="font-medium text-cyan-200">{activePoint.label}</p>
            <p>Ingresos ${activePoint.revenue.toLocaleString("es-MX")}</p>
            <p>Pagos ${activePoint.payments.toLocaleString("es-MX")}</p>
            <p className="text-rose-200/90">Reemb. ${activePoint.refunds.toLocaleString("es-MX")}</p>
          </motion.div>
        ) : null}
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          className="min-h-[200px] min-w-[320px] touch-pan-x"
          role="img"
          aria-label="Gráfico de flujo analítico"
        >
          <defs>
            <linearGradient id="ins-rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(45,212,191,0.5)" />
              <stop offset="100%" stopColor="rgba(45,212,191,0)" />
            </linearGradient>
          </defs>
          {[0, 0.33, 0.66, 1].map((t) => (
            <line
              key={`g-${t}`}
              x1={PAD}
              x2={W - PAD}
              y1={PAD + (H - PAD * 2) * t}
              y2={PAD + (H - PAD * 2) * t}
              stroke="rgba(148,163,184,0.12)"
              strokeDasharray="4 6"
            />
          ))}
          <path d={`${paths.revenue} L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`} fill="url(#ins-rev)" opacity={0.35} />
          <path d={paths.revenue} fill="none" stroke="rgba(45,212,191,0.95)" strokeWidth={2.4} strokeLinejoin="round" />
          <path d={paths.payments} fill="none" stroke="rgba(96,165,250,0.95)" strokeWidth={2} strokeLinejoin="round" />
          <path d={paths.refunds} fill="none" stroke="rgba(251,113,133,0.95)" strokeWidth={2} strokeLinejoin="round" />
          {series.map((p, i) => {
            const innerW = W - PAD * 2;
            const innerH = H - PAD * 2;
            const step = series.length > 1 ? innerW / (series.length - 1) : innerW;
            const cx = PAD + i * step;
            const cy = PAD + innerH - (p.revenue / maxY) * innerH;
            return (
              <circle
                key={p.date}
                cx={cx}
                cy={cy}
                r={hover === i || (hover === null && i === series.length - 1) ? 5 : 3}
                className="cursor-pointer fill-cyan-200/90 transition-all hover:fill-white"
                onMouseEnter={() => {
                  setHover(i);
                  setHighlight(i);
                }}
                onMouseLeave={() => {
                  setHover(null);
                  setHighlight(null);
                }}
              />
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-[var(--muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-teal-400" /> Ingresos
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-400" /> Pagos
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-400" /> Reembolsos
        </span>
      </div>
    </InsightsGlassPanel>
  );
}
