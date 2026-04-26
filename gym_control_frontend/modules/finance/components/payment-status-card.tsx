"use client";

import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function PaymentStatusCard({ completed, total }: { completed: number; total: number }) {
  const pct = total ? Math.round((completed / total) * 100) : 0;
  return (
    <Card className="border-white/10 bg-white/5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        <p className="text-sm font-semibold text-white">Estado de cobros</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{pct}%</p>
      <p className="text-xs text-[var(--muted)]">
        {completed} exitosos de {total} en periodo
      </p>
    </Card>
  );
}
