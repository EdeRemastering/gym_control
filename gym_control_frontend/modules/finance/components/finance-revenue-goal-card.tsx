"use client";

import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FinanceRevenueGoalCardProps {
  current: number;
  goal: number;
  progressPct: number;
}

export function FinanceRevenueGoalCard({ current, goal, progressPct }: FinanceRevenueGoalCardProps) {
  return (
    <Card className="border-white/10 bg-white/5">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-cyan-300" />
        <p className="text-sm font-semibold text-white">Meta de ingresos mensual</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">
        ${Math.round(current).toLocaleString()}{" "}
        <span className="text-sm font-normal text-[var(--muted)]">/ ${goal.toLocaleString()}</span>
      </p>
      <div className="mt-3 h-2 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">{progressPct}% completado</p>
    </Card>
  );
}
