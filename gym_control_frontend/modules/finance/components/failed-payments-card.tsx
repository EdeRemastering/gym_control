"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FailedPaymentsCardProps {
  count: number;
  onReview: () => void;
}

export function FailedPaymentsCard({ count, onReview }: FailedPaymentsCardProps) {
  return (
    <Card className="border-rose-500/25 bg-rose-500/5">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-rose-300" />
        <p className="text-sm font-semibold text-white">Pagos fallidos</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-rose-200">{count}</p>
      <p className="text-xs text-[var(--muted)]">Reintentos y recuperación de ingresos</p>
      <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={onReview}>
        Revisar fallidos
      </Button>
    </Card>
  );
}
