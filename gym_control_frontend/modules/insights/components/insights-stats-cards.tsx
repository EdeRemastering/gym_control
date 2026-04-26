"use client";

import { AverageRevenueCard } from "@/modules/insights/components/average-revenue-card";
import { ActiveClientsCard } from "@/modules/insights/components/active-clients-card";
import { RetentionCard } from "@/modules/insights/components/retention-card";
import { ChurnRateCard } from "@/modules/insights/components/churn-rate-card";
import { ConversionRateCard } from "@/modules/insights/components/conversion-rate-card";
import { AverageTicketCard } from "@/modules/insights/components/average-ticket-card";
import { LtvAverageCard } from "@/modules/insights/components/ltv-average-card";
import { RoiCampaignsCard } from "@/modules/insights/components/roi-campaigns-card";

export function InsightsStatsCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
      <AverageRevenueCard />
      <ActiveClientsCard />
      <RetentionCard />
      <ChurnRateCard />
      <ConversionRateCard />
      <AverageTicketCard />
      <LtvAverageCard />
      <RoiCampaignsCard />
    </div>
  );
}
