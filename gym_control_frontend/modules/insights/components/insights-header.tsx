"use client";

import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronRight, FlaskConical, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INSIGHTS_BRANCH_OPTIONS, INSIGHTS_DATE_PRESETS, INSIGHTS_PLAN_SEGMENTS } from "@/modules/insights/constants/insights.constants";
import { useInsightsActions } from "@/modules/insights/hooks/use-insights-actions";
import { useInsightsFiltersStore } from "@/modules/insights/store/use-insights-filters-store";
import type { InsightsDatePreset, PlanSegmentFilter } from "@/modules/insights/types/insights.types";
import { InsightsGlassPanel } from "@/modules/insights/components/insights-glass-panel";

function rangeLabel(preset: InsightsDatePreset): string {
  const end = new Date();
  const days = preset === "7d" ? 6 : preset === "30d" ? 29 : 89;
  const start = subDays(end, days);
  return `${format(start, "d MMM", { locale: es })} – ${format(end, "d MMM yyyy", { locale: es })}`;
}

export function InsightsHeader() {
  const datePreset = useInsightsFiltersStore((s) => s.datePreset);
  const branchId = useInsightsFiltersStore((s) => s.branchId);
  const planSegment = useInsightsFiltersStore((s) => s.planSegment);
  const setDatePreset = useInsightsFiltersStore((s) => s.setDatePreset);
  const setBranchId = useInsightsFiltersStore((s) => s.setBranchId);
  const setPlanSegment = useInsightsFiltersStore((s) => s.setPlanSegment);
  const { openCreateInsight, exportDataset } = useInsightsActions();

  return (
    <InsightsGlassPanel className="p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            <span>Zudel OS</span>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span>Analisis</span>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span className="text-cyan-300/90">Operativo</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
              <FlaskConical className="h-5 w-5 text-cyan-200" aria-hidden />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">Panel de analisis</h2>
              <p className="max-w-xl text-sm text-[var(--muted)]">
                Revisa indicadores clave, detecta alertas y toma decisiones con datos claros.
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
            <Select value={datePreset} onValueChange={(v) => setDatePreset(v as InsightsDatePreset)}>
              <SelectTrigger className="h-10 w-full border-white/10 bg-black/25 sm:w-[140px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                {INSIGHTS_DATE_PRESETS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 px-3 text-xs font-medium text-white/90 sm:min-w-[180px]">
              {rangeLabel(datePreset)}
            </div>

            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger className="h-10 w-full border-white/10 bg-black/25 sm:w-[160px]">
                <SelectValue placeholder="Sede" />
              </SelectTrigger>
              <SelectContent>
                {INSIGHTS_BRANCH_OPTIONS.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={planSegment} onValueChange={(v) => setPlanSegment(v as PlanSegmentFilter)}>
              <SelectTrigger className="h-10 w-full border-white/10 bg-black/25 sm:w-[170px]">
                <SelectValue placeholder="Segmento" />
              </SelectTrigger>
              <SelectContent>
                {INSIGHTS_PLAN_SEGMENTS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button type="button" variant="secondary" size="sm" className="border-white/10 bg-white/5" onClick={exportDataset}>
              Exportar vista
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="shadow-[0_0_24px_rgba(34,211,238,0.35)]"
              onClick={openCreateInsight}
            >
              <Sparkles className="h-4 w-4" />
              Crear analisis
            </Button>
          </div>
        </div>
      </div>
    </InsightsGlassPanel>
  );
}
