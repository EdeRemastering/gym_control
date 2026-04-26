"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DashboardInsight } from "@/modules/dashboard/types/dashboard-pro.types";

export function DashboardInsights({ items }: { items: DashboardInsight[] }) {
  return (
    <Card className="space-y-2 border-white/10 bg-white/5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Insights inteligentes</p>
        <button type="button" className="text-xs text-cyan-300">Ver todos</button>
      </div>
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-white/10 bg-black/20 p-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-white">{item.title}</p>
            <p className="text-xs text-[var(--muted)]">{item.description}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-10 w-full sm:w-auto">{item.cta}</Button>
        </div>
      ))}
    </Card>
  );
}
