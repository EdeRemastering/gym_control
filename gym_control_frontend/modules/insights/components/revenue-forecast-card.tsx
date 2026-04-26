"use client";

import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { formatDelta } from "@/modules/insights/selectors/insights.selectors";
import type { PredictionMetric } from "@/modules/insights/types/insights.types";
import { cn } from "@/lib/utils";

export function RevenueForecastCard({ metric, index = 0 }: { metric: PredictionMetric; index?: number }) {
  const up = metric.trend === "up";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-white/10 bg-black/30 p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">{metric.label}</p>
        <TrendingUp className={cn("h-4 w-4", up ? "text-emerald-300" : "text-rose-300 rotate-180")} aria-hidden />
      </div>
      <p className="mt-2 text-xl font-semibold text-white">{metric.value}</p>
      <p className={cn("mt-1 text-xs font-medium", up ? "text-emerald-300" : "text-rose-300")}>{formatDelta(metric.deltaPct)}</p>
    </motion.div>
  );
}
