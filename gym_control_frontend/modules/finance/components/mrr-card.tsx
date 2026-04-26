"use client";

import { FinanceStatCard } from "@/modules/finance/components/finance-stat-card";
import type { FinanceKpi } from "@/modules/finance/types/finance.types";

export function MRRCard({ kpi }: { kpi: FinanceKpi }) {
  return <FinanceStatCard item={kpi} index={0} />;
}
