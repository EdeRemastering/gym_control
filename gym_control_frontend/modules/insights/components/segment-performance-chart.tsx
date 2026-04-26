"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { InsightsGlassPanel } from "@/modules/insights/components/insights-glass-panel";
import { useAnalyticsFlowStore } from "@/modules/insights/store/use-analytics-flow-store";

export function SegmentPerformanceChart() {
  const segments = useAnalyticsFlowStore((s) => s.segments);
  const total = useMemo(() => segments.reduce((s, x) => s + x.amount, 0), [segments]);

  const gradient = useMemo(() => {
    const parts = segments.reduce<{ acc: number; parts: string[] }>(
      (state, slice) => {
        const start = (state.acc / 100) * 360;
        const nextAcc = state.acc + slice.pct;
        const end = (nextAcc / 100) * 360;
        return {
          acc: nextAcc,
          parts: [...state.parts, `${slice.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`],
        };
      },
      { acc: 0, parts: [] },
    ).parts;
    return `conic-gradient(from -90deg, ${parts.join(", ")})`;
  }, [segments]);

  return (
    <InsightsGlassPanel className="flex h-full flex-col p-4 md:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-300/85">Segmentación</p>
      <h3 className="mt-1 text-lg font-semibold text-white">Rendimiento por segmento</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">Distribución estimada de ingreso por plan.</p>

      <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-5 sm:flex-row sm:items-center">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="relative h-40 w-40 shrink-0 rounded-full border border-white/10 p-2 shadow-[0_0_40px_rgba(168,85,247,0.2)]"
          style={{ background: gradient }}
        >
          <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-[#070b14]/95 text-center">
            <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">Total</p>
            <p className="text-lg font-semibold text-white">${total.toLocaleString("es-MX")}</p>
          </div>
        </motion.div>

        <ul className="w-full max-w-xs space-y-2 text-sm">
          {segments.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-black/25 px-2 py-1.5">
              <span className="flex items-center gap-2 text-white/90">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="text-xs text-[var(--muted)]">
                {s.pct}% · ${s.amount.toLocaleString("es-MX")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </InsightsGlassPanel>
  );
}
