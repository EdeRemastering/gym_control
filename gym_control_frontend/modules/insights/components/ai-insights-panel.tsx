"use client";

import { toast } from "sonner";
import { Brain } from "lucide-react";
import { InsightRecommendationCard } from "@/modules/insights/components/insight-recommendation-card";
import { InsightsGlassPanel } from "@/modules/insights/components/insights-glass-panel";
import { useAiRecommendationsStore } from "@/modules/insights/store/use-ai-recommendations-store";
import type { AiInsightItem } from "@/modules/insights/types/insights.types";

export function AIInsightsPanel() {
  const items = useAiRecommendationsStore((s) => s.items);
  const dismissed = useAiRecommendationsStore((s) => s.dismissedIds);
  const dismiss = useAiRecommendationsStore((s) => s.dismiss);
  const restoreDismissed = useAiRecommendationsStore((s) => s.restoreDismissed);

  const visible = items.filter((i) => !dismissed.includes(i.id));

  const onAction = (item: AiInsightItem) => {
    toast.message(item.ctaLabel, { description: item.title });
    dismiss(item.id);
  };

  return (
    <InsightsGlassPanel className="flex h-full flex-col p-4 md:p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-400/25 bg-violet-500/10">
          <Brain className="h-4 w-4 text-violet-200" aria-hidden />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200/90">IA operativa</p>
          <h3 className="text-lg font-semibold text-white">Insights detectados</h3>
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">Priorización automática con contexto de negocio.</p>

      <div className="mt-4 flex max-h-[min(520px,58vh)] flex-col gap-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
        {visible.map((item, index) => (
          <InsightRecommendationCard key={item.id} item={item} index={index} onAction={onAction} />
        ))}
        {visible.length === 0 ? (
          <div className="space-y-2 rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-[var(--muted)]">
            <p>No hay insights pendientes en esta vista.</p>
            <button
              type="button"
              className="text-cyan-300 underline-offset-2 hover:underline"
              onClick={() => restoreDismissed()}
            >
              Mostrar descartados
            </button>
          </div>
        ) : null}
      </div>
    </InsightsGlassPanel>
  );
}
