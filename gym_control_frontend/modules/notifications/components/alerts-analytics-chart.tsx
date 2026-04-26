"use client";

import { Card } from "@/components/ui/card";
import type { AlertStats } from "@/modules/notifications/types/alerts.types";

interface AlertsAnalyticsChartProps {
  stats: AlertStats;
}

export function AlertsAnalyticsChart({ stats }: AlertsAnalyticsChartProps) {
  const total = Math.max(stats.total, 1);
  const criticalPct = Math.round((stats.urgent / total) * 100);
  const completedPct = Math.round((stats.resolvedToday / total) * 100);
  const infoPct = Math.max(100 - criticalPct - completedPct, 0);

  return (
    <Card className="space-y-3 border-white/10 bg-white/5">
      <p className="text-sm font-medium text-white">Estadísticas de alertas</p>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="flex h-full">
          <div className="bg-rose-400" style={{ width: `${criticalPct}%` }} />
          <div className="bg-cyan-400" style={{ width: `${infoPct}%` }} />
          <div className="bg-emerald-400" style={{ width: `${completedPct}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
        <p>Críticas/Importantes: {criticalPct}%</p>
        <p>Informativas: {infoPct}%</p>
        <p>Completadas hoy: {completedPct}%</p>
        <p>Total: {stats.total}</p>
      </div>
    </Card>
  );
}
