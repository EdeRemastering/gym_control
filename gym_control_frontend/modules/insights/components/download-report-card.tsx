"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReportItemState } from "@/modules/insights/types/insights.types";
import { cn } from "@/lib/utils";

const accentBorder: Record<ReportItemState["accent"], string> = {
  danger: "border-rose-400/25 hover:border-rose-400/40",
  info: "border-sky-400/25 hover:border-sky-400/40",
  success: "border-emerald-400/25 hover:border-emerald-400/40",
  warning: "border-amber-400/25 hover:border-amber-400/40",
  violet: "border-violet-400/25 hover:border-violet-400/40",
};

export function DownloadReportCard({
  report,
  onDownload,
}: {
  report: ReportItemState;
  onDownload: (id: string, title: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex min-w-[200px] flex-1 flex-col justify-between rounded-xl border bg-black/25 p-3 transition",
        accentBorder[report.accent],
      )}
    >
      <div>
        <p className="text-sm font-semibold text-white">{report.title}</p>
        <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{report.description}</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[10px] text-white/40">
          {report.lastDownloadedAt
            ? `Último: ${new Date(report.lastDownloadedAt).toLocaleDateString("es-MX")}`
            : "Sin descargas"}
        </span>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shrink-0 border-white/10 bg-white/5"
          disabled={report.isGenerating}
          onClick={() => onDownload(report.id, report.title)}
        >
          {report.isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
