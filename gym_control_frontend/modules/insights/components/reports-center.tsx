"use client";

import { FileStack } from "lucide-react";
import { DownloadReportCard } from "@/modules/insights/components/download-report-card";
import { InsightsGlassPanel } from "@/modules/insights/components/insights-glass-panel";
import { useInsightsActions } from "@/modules/insights/hooks/use-insights-actions";
import { useReportsCenterStore } from "@/modules/insights/store/use-reports-center-store";

export function ReportsCenter() {
  const reports = useReportsCenterStore((s) => s.reports);
  const { simulateReportDownload } = useInsightsActions();

  return (
    <InsightsGlassPanel className="p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <FileStack className="h-4 w-4 text-sky-300" aria-hidden />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Entregables</p>
          <h3 className="text-lg font-semibold text-white">Centro de reportes</h3>
        </div>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">Descarga paquetes listos para junta directiva o auditoría.</p>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {reports.map((r) => (
          <DownloadReportCard key={r.id} report={r} onDownload={simulateReportDownload} />
        ))}
      </div>
    </InsightsGlassPanel>
  );
}
