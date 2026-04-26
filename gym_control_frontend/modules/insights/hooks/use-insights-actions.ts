"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useInsightsActivityStore } from "@/modules/insights/store/use-insights-activity-store";
import { useInsightsUiStore } from "@/modules/insights/store/use-insights-ui-store";
import { useReportsCenterStore } from "@/modules/insights/store/use-reports-center-store";

export function useInsightsActions() {
  const openCreateInsight = useCallback(() => {
    useInsightsUiStore.getState().setCreateInsightOpen(true);
  }, []);

  const simulateReportDownload = useCallback((reportId: string, title: string) => {
    const { setGenerating, markDownloaded } = useReportsCenterStore.getState();
    setGenerating(reportId, true);
    toast.message(`Generando ${title}…`, { description: "Preparando exportación segura." });
    window.setTimeout(() => {
      markDownloaded(reportId, new Date().toISOString());
      toast.success("Listo para descarga", { description: title });
    }, 1400);
  }, []);

  const pushQuickAuditEvent = useCallback(() => {
    useInsightsActivityStore.getState().prependOptimistic({
      id: `audit-${Date.now()}`,
      title: "Auditoría programada",
      subtitle: "Cola de revisión · compliance",
      variant: "info",
      at: new Date().toISOString(),
    });
    toast.success("Auditoría agendada", { description: "Aparecerá en actividad reciente." });
  }, []);

  const exportDataset = useCallback(() => {
    toast.promise(
      new Promise((resolve) => {
        window.setTimeout(resolve, 900);
      }),
      {
        loading: "Exportando dataset anonimizado…",
        success: "CSV generado (demo)",
        error: "No pudimos exportar",
      },
    );
  }, []);

  return {
    openCreateInsight,
    simulateReportDownload,
    pushQuickAuditEvent,
    exportDataset,
  };
}
