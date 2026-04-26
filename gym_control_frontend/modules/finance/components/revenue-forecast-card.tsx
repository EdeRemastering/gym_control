"use client";

import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

export function RevenueForecastCard({ nextMonthEstimate }: { nextMonthEstimate: string }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-emerald-300" />
        <p className="text-sm font-semibold text-white">Forecast de ingresos</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{nextMonthEstimate}</p>
      <p className="text-xs text-[var(--muted)]">Proyección basada en MRR y estacionalidad</p>
      <div className="mt-3 h-2 rounded-full bg-white/10">
        <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
      </div>
    </Card>
  );
}
