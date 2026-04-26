"use client";

import { Card } from "@/components/ui/card";
import { ResponsiveDataView } from "@/components/responsive-data-view";
import type { BranchPerformanceRow } from "@/modules/finance/types/finance.types";

const perfClass: Record<BranchPerformanceRow["performance"], string> = {
  excelente: "bg-emerald-500/20 text-emerald-200",
  bueno: "bg-cyan-500/20 text-cyan-200",
  riesgo: "bg-amber-500/20 text-amber-200",
};

export function BranchPerformanceTable({ rows }: { rows: BranchPerformanceRow[] }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <p className="text-sm font-semibold text-white">Rendimiento por sede</p>
      <ResponsiveDataView
        className="mt-3"
        mobile={
          <div className="space-y-2">
            {rows.map((row) => (
              <article key={`mobile-${row.branch}`} className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/90">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-white">{row.branch}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${perfClass[row.performance]}`}>
                    {row.performance}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <p><span className="text-[var(--muted)]">Ingresos:</span> {row.income}</p>
                  <p><span className="text-[var(--muted)]">Variación:</span> {row.variation}</p>
                  <p><span className="text-[var(--muted)]">Clientes:</span> {row.clients}</p>
                  <p><span className="text-[var(--muted)]">Nuevos:</span> {row.newClients}</p>
                  <p><span className="text-[var(--muted)]">Churn:</span> {row.churn}</p>
                  <p><span className="text-[var(--muted)]">ARPU:</span> {row.arpu}</p>
                </div>
              </article>
            ))}
          </div>
        }
        desktop={
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="text-[var(--muted)]">
                <tr>
                  <th className="pb-2 font-medium">Sede</th>
                  <th className="pb-2 font-medium">Ingresos</th>
                  <th className="pb-2 font-medium">Variación</th>
                  <th className="pb-2 font-medium">Clientes</th>
                  <th className="pb-2 font-medium">Nuevos</th>
                  <th className="pb-2 font-medium">Churn</th>
                  <th className="pb-2 font-medium">ARPU</th>
                  <th className="pb-2 font-medium">Rendimiento</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.branch} className="border-t border-white/10 text-white/90">
                    <td className="py-2 font-medium">{row.branch}</td>
                    <td className="py-2">{row.income}</td>
                    <td className="py-2">{row.variation}</td>
                    <td className="py-2">{row.clients}</td>
                    <td className="py-2">{row.newClients}</td>
                    <td className="py-2">{row.churn}</td>
                    <td className="py-2">{row.arpu}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${perfClass[row.performance]}`}>
                        {row.performance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />
    </Card>
  );
}
