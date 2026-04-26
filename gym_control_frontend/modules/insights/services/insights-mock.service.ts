import { INSIGHTS_REPORTS } from "@/modules/insights/constants/insights.constants";
import type { ReportItemState } from "@/modules/insights/types/insights.types";

/** Catálogo de reportes descargables (metadatos fijos). */
export function buildReportStates(): ReportItemState[] {
  return INSIGHTS_REPORTS.map((r) => ({
    ...r,
    lastDownloadedAt: null,
    isGenerating: false,
  }));
}
