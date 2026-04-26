import { isToday, subDays } from "date-fns";
import type { AlertFilters, AlertItemView, AlertStats } from "@/modules/notifications/types/alerts.types";

export function getAlertStats(alerts: AlertItemView[]): AlertStats {
  return {
    total: alerts.length,
    urgent: alerts.filter((alert) => alert.priority === "critical" || alert.priority === "important").length,
    unread: alerts.filter((alert) => !alert.isRead).length,
    resolvedToday: alerts.filter((alert) => alert.status === "completed" && isToday(new Date(alert.createdAt))).length,
  };
}

export function getBranchOptions(alerts: AlertItemView[]): string[] {
  return Array.from(new Set(alerts.map((alert) => alert.branch))).sort((a, b) => a.localeCompare(b));
}

export function getOwnerOptions(alerts: AlertItemView[]): string[] {
  return Array.from(new Set(alerts.map((alert) => alert.owner))).sort((a, b) => a.localeCompare(b));
}

export function filterAlerts(alerts: AlertItemView[], filters: AlertFilters): AlertItemView[] {
  const now = new Date();
  const fromDate =
    filters.dateRange === "today"
      ? subDays(now, 1)
      : filters.dateRange === "7d"
        ? subDays(now, 7)
        : subDays(now, 30);

  return alerts.filter((alert) => {
    const createdAt = new Date(alert.createdAt);
    const passesSearch =
      filters.search.length === 0 ||
      [alert.title, alert.message, alert.owner, alert.branch].join(" ").toLowerCase().includes(filters.search.toLowerCase());

    return (
      createdAt >= fromDate &&
      (filters.priority === "all" || alert.priority === filters.priority) &&
      (filters.scope === "all" || alert.scope === filters.scope) &&
      (filters.branch === "all" || alert.branch === filters.branch) &&
      (filters.owner === "all" || alert.owner === filters.owner) &&
      (filters.status === "all" || alert.status === filters.status) &&
      passesSearch
    );
  });
}
