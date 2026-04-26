"use client";

import { Card } from "@/components/ui/card";
import type { DashboardAlert } from "@/modules/dashboard/types/dashboard-pro.types";

export function DashboardCriticalAlerts({ alerts }: { alerts: DashboardAlert[] }) {
  return (
    <Card className="space-y-2 border-white/10 bg-white/5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Alertas críticas</p>
        <button type="button" className="text-xs text-cyan-300">Ver todas</button>
      </div>
      {alerts.map((alert) => (
        <div key={alert.id} className="rounded-lg border border-white/10 bg-black/20 p-2.5">
          <p className="text-sm leading-snug text-white">{alert.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">{alert.hint}</p>
          <p className="mt-1 text-[11px] text-[var(--muted)]">{alert.at}</p>
        </div>
      ))}
    </Card>
  );
}
