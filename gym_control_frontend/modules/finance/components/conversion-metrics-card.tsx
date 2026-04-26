"use client";

import { Card } from "@/components/ui/card";

export function ConversionMetricsCard({ trialConversion, churn }: { trialConversion: number; churn: number }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <p className="text-sm font-semibold text-white">Métricas de conversión</p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-2xl font-semibold text-cyan-300">{trialConversion}%</p>
          <p className="text-[11px] text-[var(--muted)]">Trial → pago</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-2xl font-semibold text-rose-300">{churn}%</p>
          <p className="text-[11px] text-[var(--muted)]">Churn mensual</p>
        </div>
      </div>
    </Card>
  );
}
