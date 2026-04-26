"use client";

import type { ModuleShellProps } from "@/lib/module-shell-props";
import { DashboardActivityList } from "@/modules/dashboard/components/dashboard-activity-list";
import { DashboardCriticalAlerts } from "@/modules/dashboard/components/dashboard-critical-alerts";
import { DashboardGoalCard } from "@/modules/dashboard/components/dashboard-goal-card";
import { DashboardHeader } from "@/modules/dashboard/components/dashboard-header";
import { DashboardInsights } from "@/modules/dashboard/components/dashboard-insights";
import { DashboardKpis } from "@/modules/dashboard/components/dashboard-kpis";
import { DashboardMainCharts } from "@/modules/dashboard/components/dashboard-main-charts";
import { DashboardQuickActions } from "@/modules/dashboard/components/dashboard-quick-actions";
import { useDashboard } from "@/modules/dashboard/hooks/use-dashboard";

export function DashboardModule({ role }: ModuleShellProps) {
  const { kpis, alerts, insights, activity, totalRevenue } = useDashboard(role);

  return (
    <div className="grid gap-3 md:gap-4">
      <DashboardHeader />
      <DashboardKpis items={kpis} />
      <div className="grid gap-3 md:gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3 md:space-y-4">
          <DashboardMainCharts revenueValue={kpis[0]?.value ?? "$0"} activeMemberships={kpis[2]?.value ?? "0"} attendance={kpis[4]?.value ?? "0%"} />
          <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
            <DashboardActivityList items={activity} />
            <DashboardInsights items={insights} />
          </div>
        </div>
        <div className="space-y-3 md:space-y-4">
          <DashboardCriticalAlerts alerts={alerts} />
          <DashboardQuickActions />
          <DashboardGoalCard revenue={totalRevenue} goal={30000} />
        </div>
      </div>
    </div>
  );
}
