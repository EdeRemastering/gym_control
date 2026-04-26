export type InsightsDatePreset = "7d" | "30d" | "90d";

export type AiInsightIconKey = "trendingDown" | "creditCard" | "sparkles" | "mapPin" | "userX";

export type InsightPriority = "critical" | "high" | "medium" | "low";

export type InsightTone = "danger" | "info" | "success" | "warning" | "violet";

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  deltaPct: number;
  deltaLabel: string;
  /** 0–100 sparkline heights normalized */
  sparkline: number[];
  accent: "violet" | "blue" | "teal" | "orange" | "emerald" | "cyan" | "rose" | "amber";
}

export interface FlowSeriesPoint {
  date: string;
  label: string;
  revenue: number;
  payments: number;
  refunds: number;
}

export interface SegmentSlice {
  id: string;
  label: string;
  pct: number;
  amount: number;
  color: string;
}

export interface AiInsightItem {
  id: string;
  title: string;
  description: string;
  priority: InsightPriority;
  tone: InsightTone;
  ctaLabel: string;
  iconKey: AiInsightIconKey;
}

export interface FunnelStage {
  id: string;
  label: string;
  value: number;
  pctOfTop: number;
  hint?: string;
}

export interface BehaviorFunnelStage {
  id: string;
  label: string;
  value: number;
  pct: number;
}

export interface AnalyticsEventItem {
  id: string;
  title: string;
  subtitle: string;
  variant: "success" | "failed" | "refund" | "info" | "upgrade" | "downgrade" | "cancel" | "alert";
  at: string;
}

export interface PredictionMetric {
  id: string;
  label: string;
  value: string;
  deltaPct: number;
  trend: "up" | "down" | "flat";
}

export interface BranchForecast {
  branch: string;
  revenue: number;
  confidence: number;
}

export interface TopLtvClient {
  id: string;
  rank: number;
  name: string;
  plan: string;
  ltv: number;
  tenureMonths: number;
  upgradeProbability: number;
}

export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  accent: InsightTone;
}

export interface ReportItemState extends ReportDefinition {
  lastDownloadedAt: string | null;
  isGenerating: boolean;
}

export interface SmartAlertSummary {
  id: string;
  label: string;
  count: number;
  severity: InsightPriority;
}

export type PlanSegmentFilter = "all" | "premium" | "enterprise" | "basic" | "corporate";
