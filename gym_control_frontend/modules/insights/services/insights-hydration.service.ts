import type { Membership, Payment, Plan, User } from "@/lib/types";
import { computeInsightsFromApi } from "@/modules/insights/services/insights-compute-from-api";
import { buildReportStates } from "@/modules/insights/services/insights-mock.service";
import { useAiRecommendationsStore } from "@/modules/insights/store/use-ai-recommendations-store";
import { useAnalyticsFlowStore } from "@/modules/insights/store/use-analytics-flow-store";
import { useFunnelStore } from "@/modules/insights/store/use-funnel-store";
import { useInsightsActivityStore } from "@/modules/insights/store/use-insights-activity-store";
import { useInsightsKpiStore } from "@/modules/insights/store/use-insights-kpi-store";
import { useInsightsMetaStore } from "@/modules/insights/store/use-insights-meta-store";
import { usePredictionsStore } from "@/modules/insights/store/use-predictions-store";
import { useReportsCenterStore } from "@/modules/insights/store/use-reports-center-store";
import { useSmartAlertsStore } from "@/modules/insights/store/use-smart-alerts-store";
import { useTopLtvStore } from "@/modules/insights/store/use-top-ltv-store";
import type { InsightsDatePreset, PlanSegmentFilter } from "@/modules/insights/types/insights.types";

export interface InsightsHydrationPayload {
  payments: Payment[];
  users: User[];
  memberships: Membership[];
  plans: Plan[];
}

export function buildCacheKey(branchId: string, planSegment: string, datePreset: string): string {
  return `${branchId}|${planSegment}|${datePreset}`;
}

export function hydrateAllInsightStores(
  api: InsightsHydrationPayload,
  filters: { branchId: string; planSegment: PlanSegmentFilter; datePreset: InsightsDatePreset },
) {
  const computed = computeInsightsFromApi({
    payments: api.payments ?? [],
    users: api.users ?? [],
    memberships: api.memberships ?? [],
    plans: api.plans ?? [],
    filters,
  });

  useInsightsKpiStore.getState().setKpis(computed.kpis);
  useInsightsKpiStore.getState().setLoading(false);
  useInsightsKpiStore.getState().setError(null);

  useAnalyticsFlowStore.getState().setSeries(computed.series);
  useAnalyticsFlowStore.getState().setSegments(computed.segments);
  useAnalyticsFlowStore.getState().setLoading(false);

  useAiRecommendationsStore.getState().setItems(computed.aiInsights);
  useAiRecommendationsStore.getState().setLoading(false);

  useFunnelStore.getState().setConversion(computed.conversion);
  useFunnelStore.getState().setBehavior(computed.behavior);
  useFunnelStore.getState().setLoading(false);

  usePredictionsStore.getState().setMetrics(computed.predictions);
  usePredictionsStore.getState().setBranchForecasts(computed.branchForecasts);
  usePredictionsStore.getState().setLoading(false);

  useInsightsActivityStore.getState().setEvents(computed.events);
  useInsightsActivityStore.getState().setLoading(false);

  useTopLtvStore.getState().setClients(computed.topLtv);
  useTopLtvStore.getState().setLoading(false);

  useReportsCenterStore.getState().setReports(buildReportStates());
  useReportsCenterStore.getState().setLoading(false);

  useSmartAlertsStore.getState().setSummaries(computed.smartAlerts);
  useSmartAlertsStore.getState().setLoading(false);

  const cacheKey = buildCacheKey(filters.branchId, filters.planSegment, filters.datePreset);
  useInsightsMetaStore.getState().setHydrated(Date.now(), cacheKey);
}
