"use client";

import { Card } from "@/components/ui/card";

export function DashboardMainCharts({ revenueValue, activeMemberships, attendance }: { revenueValue: string; activeMemberships: string; attendance: string }) {
  return (
    <div className="grid gap-2 lg:grid-cols-3">
      <Card className="space-y-2 border-white/10 bg-white/5 lg:col-span-1">
        <p className="text-sm text-[var(--muted)]">Ingresos</p>
        <p className="text-2xl font-semibold text-white sm:text-3xl">{revenueValue}</p>
        <div className="h-24 rounded-lg bg-[linear-gradient(180deg,rgba(168,85,247,0.25),rgba(168,85,247,0.05))]" />
      </Card>
      <Card className="space-y-2 border-white/10 bg-white/5 lg:col-span-1">
        <p className="text-sm text-[var(--muted)]">Membresías activas</p>
        <p className="text-2xl font-semibold text-white sm:text-3xl">{activeMemberships}</p>
        <div className="h-24 rounded-lg bg-[linear-gradient(180deg,rgba(34,211,238,0.25),rgba(34,211,238,0.05))]" />
      </Card>
      <Card className="space-y-2 border-white/10 bg-white/5 lg:col-span-1">
        <p className="text-sm text-[var(--muted)]">Asistencia por día</p>
        <p className="text-2xl font-semibold text-white sm:text-3xl">{attendance}</p>
        <div className="grid h-24 grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, idx) => <div key={`bar-${idx}`} className="rounded-md bg-cyan-400/70" />)}
        </div>
      </Card>
    </div>
  );
}
