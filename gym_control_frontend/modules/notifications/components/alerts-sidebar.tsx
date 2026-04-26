"use client";

import { AIRecommendationsCard } from "@/modules/notifications/components/ai-recommendations-card";
import { AlertsAnalyticsChart } from "@/modules/notifications/components/alerts-analytics-chart";
import { QuickActionsPanel } from "@/modules/notifications/components/quick-actions-panel";
import { RecentActivityCard } from "@/modules/notifications/components/recent-activity-card";
import type { AlertStats } from "@/modules/notifications/types/alerts.types";

interface AlertsSidebarProps {
  stats: AlertStats;
  activity: Array<{ id: string; label: string; description: string; at: string }>;
  onMarkAllRead: () => void;
  onCreateAlert: () => void;
}

export function AlertsSidebar({ stats, activity, onMarkAllRead, onCreateAlert }: AlertsSidebarProps) {
  return (
    <aside className="space-y-3">
      <QuickActionsPanel onMarkAllRead={onMarkAllRead} onCreateAlert={onCreateAlert} />
      <AIRecommendationsCard />
      <AlertsAnalyticsChart stats={stats} />
      <RecentActivityCard activity={activity} />
    </aside>
  );
}
