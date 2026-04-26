"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { FinanceKpi } from "@/modules/finance/types/finance.types";

export function FinanceStatCard({ item, index = 0 }: { item: FinanceKpi; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className="relative overflow-hidden border-white/10 bg-white/5 p-3 shadow-md shadow-black/25 ring-1 ring-white/5">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-[linear-gradient(90deg,transparent,var(--primary)_20%,transparent)] opacity-20" />
        <div className="flex items-start justify-between gap-2">
          <item.icon className={`h-4 w-4 shrink-0 ${item.tone}`} />
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">{item.label}</p>
        <p className="mt-0.5 text-xl font-semibold tabular-nums text-white">{item.value}</p>
        <p
          className={`mt-1 text-[11px] ${item.deltaPositive ? "text-emerald-400/90" : "text-amber-300/90"}`}
        >
          {item.delta}
        </p>
        <div className="mt-2 flex h-6 items-end gap-px">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-cyan-500/40 to-fuchsia-500/30"
              style={{ height: `${20 + ((i * 7) % 18)}px` }}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
