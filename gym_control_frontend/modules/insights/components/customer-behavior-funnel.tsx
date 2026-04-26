"use client";

import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { InsightsGlassPanel } from "@/modules/insights/components/insights-glass-panel";
import { useFunnelStore } from "@/modules/insights/store/use-funnel-store";

export function CustomerBehaviorFunnel() {
  const stages = useFunnelStore((s) => s.behavior);

  return (
    <InsightsGlassPanel className="p-4 md:p-5">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-emerald-300" aria-hidden />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Comportamiento</p>
          <h3 className="text-lg font-semibold text-white">Funnel de hábito</h3>
        </div>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">Engagement profundo y monetización cruzada.</p>

      <ul className="mt-4 space-y-3">
        {stages.map((s, i) => (
          <motion.li
            key={s.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-white/10 bg-black/25 p-3"
          >
            <div className="flex items-center justify-between gap-2 text-sm text-white">
              <span>{s.label}</span>
              <span className="text-emerald-200/90">{s.pct}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-400/80" style={{ width: `${s.pct}%` }} />
            </div>
          </motion.li>
        ))}
      </ul>
    </InsightsGlassPanel>
  );
}
