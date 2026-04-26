"use client";

import { FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ReportKind } from "@/modules/finance/store/use-reports-store";

interface FinancialReportsPanelProps {
  lastGenerated: Partial<Record<ReportKind, string | null>>;
  onGenerate: (kind: ReportKind) => void;
}

const REPORTS: Array<{ kind: ReportKind; label: string }> = [
  { kind: "monthly", label: "Reporte mensual" },
  { kind: "branch", label: "Reporte por sede" },
  { kind: "churn", label: "Cancelaciones / churn" },
  { kind: "refunds", label: "Reembolsos" },
  { kind: "forecast", label: "Forecast" },
];

export function FinancialReportsPanel({ lastGenerated, onGenerate }: FinancialReportsPanelProps) {
  return (
    <Card className="border-white/10 bg-white/5">
      <div className="flex items-center gap-2">
        <FileBarChart className="h-4 w-4 text-cyan-300" />
        <p className="text-sm font-semibold text-white">Reportes financieros</p>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {REPORTS.map((r) => (
          <div key={r.kind} className="rounded-lg border border-white/10 bg-black/20 p-2">
            <p className="text-xs font-medium text-white">{r.label}</p>
            <p className="text-[10px] text-[var(--muted)]">
              {lastGenerated[r.kind] ? `Último: ${new Date(lastGenerated[r.kind]!).toLocaleString()}` : "Sin generar"}
            </p>
            <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={() => onGenerate(r.kind)}>
              Generar
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
