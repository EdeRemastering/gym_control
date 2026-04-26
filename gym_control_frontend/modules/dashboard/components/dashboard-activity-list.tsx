"use client";

import { Card } from "@/components/ui/card";

export function DashboardActivityList({ items }: { items: Array<{ id: string; label: string; at: string }> }) {
  return (
    <Card className="space-y-2 border-white/10 bg-white/5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Actividad reciente</p>
        <button type="button" className="text-xs text-cyan-300">Ver todo</button>
      </div>
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-0.5 rounded-lg border border-white/10 bg-black/20 px-2 py-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white">{item.label}</p>
          <span className="text-xs text-[var(--muted)]">{item.at}</span>
        </div>
      ))}
    </Card>
  );
}
