"use client";

import { AIInsightsPanel } from "@/modules/insights/components/ai-insights-panel";
import { AnalyticsFlowChart } from "@/modules/insights/components/analytics-flow-chart";
import { ConversionFunnel } from "@/modules/insights/components/conversion-funnel";
import { CustomerBehaviorFunnel } from "@/modules/insights/components/customer-behavior-funnel";
import { InsightsHeader } from "@/modules/insights/components/insights-header";
import { InsightsStatsCards } from "@/modules/insights/components/insights-stats-cards";
import { PredictionsPanel } from "@/modules/insights/components/predictions-panel";
import { QuickActionsInsights } from "@/modules/insights/components/quick-actions-insights";
import { RecentAnalyticsEvents } from "@/modules/insights/components/recent-analytics-events";
import { ReportsCenter } from "@/modules/insights/components/reports-center";
import { RevenueTrendChart } from "@/modules/insights/components/revenue-trend-chart";
import { SegmentPerformanceChart } from "@/modules/insights/components/segment-performance-chart";
import { SmartAlertsPanel } from "@/modules/insights/components/smart-alerts-panel";
import { TopClientsByLTV } from "@/modules/insights/components/top-clients-by-ltv";

/**
 * Ensamblador visual únicamente. Sin datos, sin efectos, sin lógica de negocio.
 */
export function InsightsModule() {
  return (
    <div className="space-y-4 pb-6">
      <InsightsHeader />
      <InsightsStatsCards />

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-7">
          <AnalyticsFlowChart />
          <RevenueTrendChart />
        </div>
        <div className="flex min-h-0 flex-col gap-3 lg:col-span-3">
          <AIInsightsPanel />
        </div>
        <div className="lg:col-span-2">
          <SegmentPerformanceChart />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <ConversionFunnel />
        </div>
        <div className="lg:col-span-6">
          <CustomerBehaviorFunnel />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <RecentAnalyticsEvents />
        </div>
        <div className="lg:col-span-7">
          <TopClientsByLTV />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PredictionsPanel />
        </div>
        <div className="flex flex-col gap-3 lg:col-span-5">
          <SmartAlertsPanel />
          <QuickActionsInsights />
        </div>
      </div>

      <ReportsCenter />
    </div>
  );
}
