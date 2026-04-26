"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { DashboardKpi } from "@/modules/dashboard/types/dashboard-pro.types";

export function DashboardKpis({ items }: { items: DashboardKpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      {items.map((item, index) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
          <Card className="min-w-0 space-y-1.5 border-white/10 bg-white/5">
            <item.icon className={`h-4 w-4 ${item.tone}`} />
            <p className="truncate text-[11px] text-[var(--muted)]">{item.label}</p>
            <p className="truncate text-xl font-semibold text-white sm:text-2xl">{item.value}</p>
            <p className="truncate text-[11px] text-emerald-300">{item.delta}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
