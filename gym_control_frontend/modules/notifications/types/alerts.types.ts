export type AlertPriority = "critical" | "important" | "informative" | "completed";

export type AlertStatus = "pending" | "in_review" | "completed";

export type AlertScope = "payment" | "attendance" | "system" | "training" | "reminder";

export interface AlertItemView {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  priority: AlertPriority;
  status: AlertStatus;
  scope: AlertScope;
  branch: string;
  owner: string;
}

export interface AlertFilters {
  dateRange: "today" | "7d" | "30d";
  priority: "all" | AlertPriority;
  scope: "all" | AlertScope;
  branch: "all" | string;
  owner: "all" | string;
  status: "all" | AlertStatus;
  search: string;
}

export interface AlertStats {
  total: number;
  urgent: number;
  unread: number;
  resolvedToday: number;
}
