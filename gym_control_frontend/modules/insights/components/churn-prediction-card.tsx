"use client";

import { ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { formatDelta } from "@/modules/insights/selectors/insights.selectors";
import type { PredictionMetric } from "@/modules/insights/types/insights.types";
import { cn } from "@/lib/utils";

export function ChurnPredictionCard({ metric, index = 0 }: { metric: PredictionMetric; index?: number }) {
  const lowerIsBetter = metric.id === "churnp" || metric.id === "canc_prob";
  const up = metric.trend === "up";
  const positive = lowerIsBetter ? !up : up;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-rose-400/15 bg-gradient-to-br from-rose-500/10 to-transparent p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-rose-100/80">{metric.label}</p>
        <ShieldAlert className="h-4 w-4 text-rose-300/90" aria-hidden />
      </div>
      <p className="mt-2 text-xl font-semibold text-white">{metric.value}</p>
      <p className={cn("mt-1 text-xs font-medium", positive ? "text-emerald-300" : "text-rose-300")}>{formatDelta(metric.deltaPct)}</p>
    </motion.div>
  );
}
