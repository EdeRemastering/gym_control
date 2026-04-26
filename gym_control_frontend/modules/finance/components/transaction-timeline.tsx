"use client";

import { Card } from "@/components/ui/card";
import type { TransactionRow } from "@/modules/finance/types/finance.types";

const statusClass: Record<string, string> = {
  COMPLETED: "bg-emerald-500/20 text-emerald-200",
  FAILED: "bg-rose-500/20 text-rose-200",
  PENDING: "bg-amber-500/20 text-amber-200",
  REFUNDED: "bg-orange-500/20 text-orange-200",
  REFUND: "bg-orange-500/20 text-orange-200",
  ANNUAL: "bg-violet-500/20 text-violet-200",
  MONTHLY: "bg-cyan-500/20 text-cyan-200",
};

export function TransactionTimeline({ rows }: { rows: TransactionRow[] }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Timeline de transacciones</p>
        <span className="text-[11px] text-[var(--muted)]">Auditoría</span>
      </div>
      <div className="mt-3 max-h-[280px] space-y-2 overflow-y-auto pr-1">
        {rows.length ? (
          rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{row.title}</p>
                <p className="text-[11px] text-[var(--muted)]">{row.subtitle}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${statusClass[row.status] ?? "bg-white/10 text-white/80"}`}
                >
                  {row.status}
                </span>
                <span className="text-sm font-semibold text-white">{row.amount}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-[var(--muted)]">No hay transacciones recientes</p>
        )}
      </div>
    </Card>
  );
}
