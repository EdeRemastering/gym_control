"use client";

import { ScrollText } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { TransactionRow } from "@/modules/finance/types/finance.types";

export function AuditFinancialLog({ rows }: { rows: TransactionRow[] }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <div className="flex items-center gap-2">
        <ScrollText className="h-4 w-4 text-violet-300" />
        <p className="text-sm font-semibold text-white">Log de auditoría financiera</p>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">Resumen inmutable de movimientos recientes</p>
      <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto text-xs text-[var(--muted)]">
        {rows.slice(0, 8).map((r) => (
          <li key={`audit-${r.id}`} className="flex justify-between gap-2 border-b border-white/5 py-1">
            <span className="truncate text-white/80">{r.title}</span>
            <span className="shrink-0 text-white/60">{r.status}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
