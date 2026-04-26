"use client";

import type { RevenuePoint } from "@/lib/types";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RevenueChartMode } from "@/modules/finance/store/use-revenue-store";

interface RevenueFlowChartProps {
  points: RevenuePoint[];
  chartMode: RevenueChartMode;
  onChartMode: (mode: RevenueChartMode) => void;
}

export function RevenueFlowChart({ points, chartMode, onChartMode }: RevenueFlowChartProps) {
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <Card className="border-white/10 bg-white/5 shadow-md shadow-black/20 ring-1 ring-cyan-500/10 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white">Flujo de ingresos</p>
          <p className="text-xs text-[var(--muted)]">Ingresos vs reembolsos (vista tipo Stripe)</p>
        </div>
        <Select value={chartMode} onValueChange={(v) => onChartMode(v as RevenueChartMode)}>
          <SelectTrigger className="h-8 w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Diario</SelectItem>
            <SelectItem value="monthly">Mensual</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4 flex h-48 items-end gap-1">
        {points.length ? (
          points.map((point) => (
            <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className="w-full max-w-[28px] rounded-t-md bg-[linear-gradient(180deg,rgba(168,85,247,0.85),rgba(34,211,238,0.35))] shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                style={{ height: `${Math.max(12, (point.value / max) * 160)}px` }}
              />
              <span className="truncate text-[10px] text-[var(--muted)]">{point.label}</span>
            </div>
          ))
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--muted)]">
            Sin datos de ingresos aún
          </div>
        )}
      </div>
    </Card>
  );
}
