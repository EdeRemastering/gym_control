"use client";

import { Card } from "@/components/ui/card";
import type { UsersStats } from "@/modules/users/types/users-management.types";

export function UsersAnalyticsChart({ stats }: { stats: UsersStats }) {
  const total = Math.max(stats.total, 1);
  const activePct = Math.round((stats.active / total) * 100);
  const blockedPct = Math.round((stats.blocked / total) * 100);
  return (
    <Card className="space-y-2 border-white/10 bg-white/5">
      <p className="text-sm font-semibold text-white">Usuarios activos vs bloqueados</p>
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${Math.max(activePct - blockedPct, 0)}%` }} />
      </div>
      <p className="text-xs text-[var(--muted)]">Activos: {activePct}% · Bloqueados: {blockedPct}%</p>
    </Card>
  );
}
