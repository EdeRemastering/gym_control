"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { FunnelStage } from "@/modules/finance/types/finance.types";

export function MembershipFunnel({ stages }: { stages: FunnelStage[] }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <p className="text-sm font-semibold text-white">Embudo de membresías</p>
      <p className="mt-1 text-xs text-[var(--muted)]">Trial → conversión → churn</p>
      <div className="mt-4 space-y-2">
        {stages.map((stage, i) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3"
          >
            <div
              className="flex h-9 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-r from-violet-500/25 to-cyan-500/20 px-3 text-sm font-medium text-white shadow-inner"
              style={{ width: `${Math.max(stage.widthPct, 18)}%`, minWidth: "120px" }}
            >
              {stage.count.toLocaleString()}
            </div>
            <span className="text-xs text-[var(--muted)]">{stage.label}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
