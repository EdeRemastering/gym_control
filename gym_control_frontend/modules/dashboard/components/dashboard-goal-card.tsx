"use client";

import { Card } from "@/components/ui/card";

export function DashboardGoalCard({ revenue, goal }: { revenue: number; goal: number }) {
  const pct = Math.min(Math.round((revenue / Math.max(goal, 1)) * 100), 100);
  return (
    <Card className="space-y-2 border-white/10 bg-white/5">
      <p className="text-sm font-semibold text-white">Meta mensual de ingresos</p>
      <p className="text-xl font-semibold text-white sm:text-2xl">
        ${revenue.toLocaleString()}{" "}
        <span className="text-sm text-[var(--muted)]">/ ${goal.toLocaleString()}</span>
      </p>
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-400" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-[var(--muted)]">{pct}%</p>
    </Card>
  );
}
