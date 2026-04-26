"use client";

import { ARRCard } from "@/modules/finance/components/arr-card";
import { ChurnRateCard } from "@/modules/finance/components/churn-rate-card";
import { FinanceStatCard } from "@/modules/finance/components/finance-stat-card";
import { MRRCard } from "@/modules/finance/components/mrr-card";
import { RevenueGrowthCard } from "@/modules/finance/components/revenue-growth-card";
import type { FinanceKpi } from "@/modules/finance/types/finance.types";

export function FinanceStatsCards({ kpis }: { kpis: FinanceKpi[] }) {
  const byId = Object.fromEntries(kpis.map((k) => [k.id, k])) as Record<string, FinanceKpi>;
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
      {byId.mrr ? <MRRCard kpi={byId.mrr} /> : null}
      {byId.arr ? <ARRCard kpi={byId.arr} /> : null}
      {byId.month ? <RevenueGrowthCard kpi={byId.month} /> : null}
      {byId.churn ? <ChurnRateCard kpi={byId.churn} /> : null}
      {byId.conv ? <FinanceStatCard item={byId.conv} index={4} /> : null}
      {byId.failed ? <FinanceStatCard item={byId.failed} index={5} /> : null}
      {byId.refunds ? <FinanceStatCard item={byId.refunds} index={6} /> : null}
      {byId.ticket ? <FinanceStatCard item={byId.ticket} index={7} /> : null}
    </div>
  );
}
