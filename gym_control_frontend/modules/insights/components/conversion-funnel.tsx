"use client";

import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import { InsightsGlassPanel } from "@/modules/insights/components/insights-glass-panel";
import { useFunnelStore } from "@/modules/insights/store/use-funnel-store";

export function ConversionFunnel() {
  const stages = useFunnelStore((s) => s.conversion);
  const top = stages[0]?.value ?? 1;

  return (
    <InsightsGlassPanel className="p-4 md:p-5">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-cyan-300" aria-hidden />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Embudo</p>
          <h3 className="text-lg font-semibold text-white">Conversión comercial</h3>
        </div>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">Del lead al ingreso recurrente, con recuperación.</p>

      <div className="mt-5 space-y-2">
        {stages.map((stage, i) => {
          const widthPct = Math.max(14, (stage.value / top) * 100);
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, scaleX: 0.92 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="origin-left"
            >
              <div className="flex items-center justify-between gap-2 text-xs text-white/90">
                <span className="truncate font-medium">{stage.label}</span>
                <span className="shrink-0 text-[var(--muted)]">
                  {stage.value.toLocaleString("es-MX")}{" "}
                  <span className="text-cyan-200/90">({stage.pctOfTop}%)</span>
                </span>
              </div>
              <div className="mt-1 h-9 overflow-hidden rounded-lg border border-white/10 bg-black/35">
                <motion.div
                  className="h-full rounded-lg bg-[linear-gradient(90deg,rgba(34,211,238,0.55),rgba(168,85,247,0.45))] shadow-[0_0_18px_rgba(34,211,238,0.2)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                />
              </div>
              {stage.hint ? <p className="mt-0.5 text-[10px] text-[var(--muted)]">{stage.hint}</p> : null}
            </motion.div>
          );
        })}
      </div>
    </InsightsGlassPanel>
  );
}
