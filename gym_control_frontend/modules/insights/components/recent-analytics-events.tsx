"use client";

import { motion } from "framer-motion";
import { ActivityTimeline } from "@/modules/insights/components/activity-timeline";
import { InsightsGlassPanel } from "@/modules/insights/components/insights-glass-panel";
import { useInsightsActivityStore } from "@/modules/insights/store/use-insights-activity-store";
import { formatRelativeTime } from "@/modules/insights/utils/insights-format";
import type { AnalyticsEventItem } from "@/modules/insights/types/insights.types";
import { cn } from "@/lib/utils";

const variantDot: Record<AnalyticsEventItem["variant"], string> = {
  success: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.55)]",
  failed: "bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]",
  refund: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.45)]",
  info: "bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.45)]",
  upgrade: "bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.45)]",
  downgrade: "bg-orange-400",
  cancel: "bg-slate-400",
  alert: "bg-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.45)]",
};

export function RecentAnalyticsEvents() {
  const events = useInsightsActivityStore((s) => s.events);

  return (
    <InsightsGlassPanel className="p-4 md:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Monitor en vivo</p>
      <h3 className="mt-1 text-lg font-semibold text-white">Actividad analítica reciente</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">Pagos, riesgos y movimientos de suscripción.</p>

      <ActivityTimeline className="mt-5 space-y-3">
        {events.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="relative flex gap-3"
          >
            <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", variantDot[e.variant])} />
            <div className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/25 px-3 py-2">
              <p className="text-sm font-medium text-white">{e.title}</p>
              <p className="text-xs text-[var(--muted)]">{e.subtitle}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-white/40">{formatRelativeTime(e.at)}</p>
            </div>
          </motion.div>
        ))}
      </ActivityTimeline>
    </InsightsGlassPanel>
  );
}
