"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { buildSparklinePath } from "@/modules/insights/lib/sparkline-path";
import { formatDelta, isPositiveGood } from "@/modules/insights/selectors/insights.selectors";
import type { KpiMetric } from "@/modules/insights/types/insights.types";

const accentRing: Record<KpiMetric["accent"], string> = {
  violet: "shadow-[0_0_24px_rgba(168,85,247,0.22)] border-fuchsia-400/20",
  blue: "shadow-[0_0_24px_rgba(59,130,246,0.22)] border-blue-400/20",
  teal: "shadow-[0_0_24px_rgba(45,212,191,0.2)] border-teal-400/20",
  orange: "shadow-[0_0_24px_rgba(251,146,60,0.2)] border-orange-400/25",
  emerald: "shadow-[0_0_24px_rgba(52,211,153,0.2)] border-emerald-400/20",
  cyan: "shadow-[0_0_24px_rgba(34,211,238,0.22)] border-cyan-400/20",
  rose: "shadow-[0_0_24px_rgba(244,63,94,0.18)] border-rose-400/20",
  amber: "shadow-[0_0_24px_rgba(251,191,36,0.2)] border-amber-400/25",
};

const accentSpark: Record<KpiMetric["accent"], string> = {
  violet: "stroke-fuchsia-400/90",
  blue: "stroke-blue-400/90",
  teal: "stroke-teal-300/90",
  orange: "stroke-orange-300/90",
  emerald: "stroke-emerald-300/90",
  cyan: "stroke-cyan-300/90",
  rose: "stroke-rose-300/90",
  amber: "stroke-amber-300/90",
};

export function InsightsKpiSurface({ metric, index = 0 }: { metric: KpiMetric; index?: number }) {
  const good = isPositiveGood(metric.id, metric.deltaPct);
  const path = buildSparklinePath(metric.sparkline, 120, 32);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] p-4",
        accentRing[metric.accent],
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.12),transparent_45%)]" />
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">{metric.label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{metric.value}</p>
      <p
        className={cn(
          "mt-1 text-xs font-medium",
          good ? "text-emerald-300/95" : metric.deltaPct === 0 ? "text-[var(--muted)]" : "text-rose-300/95",
        )}
      >
        {formatDelta(metric.deltaPct)} <span className="font-normal text-[var(--muted)]">{metric.deltaLabel}</span>
      </p>
      <svg className="mt-3 h-9 w-full" viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden>
        <path
          d={path}
          fill="none"
          strokeWidth={2}
          className={accentSpark[metric.accent]}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </motion.div>
  );
}
