"use client";

import { Card } from "@/components/ui/card";
import type { RevenuePoint } from "@/lib/types";

export function CashflowChart({ points }: { points: RevenuePoint[] }) {
  const total = points.reduce((s, p) => s + p.value, 0);
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <Card className="border-white/10 bg-white/5">
      <p className="text-sm font-semibold text-white">Cashflow</p>
      <p className="text-2xl font-semibold text-white">${total.toLocaleString()}</p>
      <p className="text-xs text-emerald-300">+12.4% vs año anterior</p>
      <div className="mt-3 flex h-40 items-end gap-0.5">
        {points.map((p) => (
          <div
            key={`cf-${p.label}`}
            className="flex-1 rounded-sm bg-gradient-to-t from-violet-600/80 to-cyan-400/50"
            style={{ height: `${Math.max(8, (p.value / max) * 100)}%` }}
          />
        ))}
      </div>
    </Card>
  );
}
