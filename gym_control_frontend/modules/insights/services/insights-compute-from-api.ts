import type { Membership, Payment, Plan, User } from "@/lib/types";
import type {
  AiInsightItem,
  AnalyticsEventItem,
  BehaviorFunnelStage,
  BranchForecast,
  FlowSeriesPoint,
  FunnelStage,
  InsightsDatePreset,
  KpiMetric,
  PlanSegmentFilter,
  PredictionMetric,
  SegmentSlice,
  SmartAlertSummary,
  TopLtvClient,
} from "@/modules/insights/types/insights.types";

const DAY_MS = 86_400_000;

const SEGMENT_COLORS: Record<string, string> = {
  enterprise: "rgba(34,211,238,0.92)",
  premium: "rgba(168,85,247,0.95)",
  corporate: "rgba(251,191,36,0.92)",
  basic: "rgba(52,211,153,0.9)",
  other: "rgba(148,163,184,0.85)",
};

export interface InsightsApiInput {
  payments: Payment[];
  users: User[];
  memberships: Membership[];
  plans: Plan[];
  filters: {
    datePreset: InsightsDatePreset;
    branchId: string;
    planSegment: PlanSegmentFilter;
  };
}

function money(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number.parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function presetDays(preset: InsightsDatePreset): number {
  if (preset === "30d") return 30;
  if (preset === "90d") return 90;
  return 7;
}

function getWindow(preset: InsightsDatePreset): { start: Date; days: number } {
  const end = new Date();
  const days = presetDays(preset);
  const start = startOfDay(new Date(end.getTime() - (days - 1) * DAY_MS));
  return { start, days };
}

function inWindow(iso: string, start: Date, end: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t <= end.getTime() + DAY_MS - 1;
}

function buildPlanTiers(plans: Plan[]): Map<string, PlanSegmentFilter> {
  const map = new Map<string, PlanSegmentFilter>();
  if (plans.length === 0) return map;
  const sorted = [...plans].sort((a, b) => money(b.price) - money(a.price));
  sorted.forEach((p, i) => {
    const n = sorted.length;
    let tier: PlanSegmentFilter;
    if (n === 1) tier = "premium";
    else if (n === 2) tier = i === 0 ? "enterprise" : "basic";
    else {
      const r = i / (n - 1);
      if (r <= 0.2) tier = "enterprise";
      else if (r <= 0.45) tier = "premium";
      else if (r <= 0.7) tier = "corporate";
      else tier = "basic";
    }
    map.set(p.id, tier);
  });
  return map;
}

function resolvePlanIdForPayment(p: Payment, memberships: Membership[]): string | null {
  if (p.membershipId) {
    const m = memberships.find((x) => x.id === p.membershipId);
    return m?.planId ?? null;
  }
  const now = Date.now();
  const actives = memberships.filter(
    (m) => m.userId === p.userId && m.status === "ACTIVE" && new Date(m.endDate).getTime() > now,
  );
  actives.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
  return actives[0]?.planId ?? null;
}

function paymentMatchesSegment(
  p: Payment,
  memberships: Membership[],
  planTiers: Map<string, PlanSegmentFilter>,
  segment: PlanSegmentFilter,
): boolean {
  if (segment === "all") return true;
  const planId = resolvePlanIdForPayment(p, memberships);
  if (!planId) return segment === "basic";
  const tier = planTiers.get(planId) ?? "basic";
  return tier === segment;
}

function normalizeSpark(values: number[], target = 14): number[] {
  if (values.length === 0) return Array(target).fill(12);
  const max = Math.max(...values, 1);
  const scaled = values.map((v) => Math.round(Math.min(100, Math.max(8, (v / max) * 100))));
  if (scaled.length >= target) return scaled.slice(-target);
  const pad = Array(target - scaled.length).fill(scaled[0] ?? 12);
  return [...pad, ...scaled];
}

function deltaPct(prev: number, curr: number): number {
  if (prev <= 0 && curr <= 0) return 0;
  if (prev <= 0) return 100;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

function formatUsd(n: number): string {
  return `$${Math.round(n).toLocaleString("es-MX")}`;
}

function buildFlowSeriesFromPayments(payments: Payment[], windowStart: Date, days: number): FlowSeriesPoint[] {
  const points: FlowSeriesPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(windowStart.getTime() + i * DAY_MS);
    const dayStart = startOfDay(d).getTime();
    const dayEnd = dayStart + DAY_MS - 1;
    const label = d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });

    let revenue = 0;
    let paySum = 0;
    let refunds = 0;
    for (const p of payments) {
      const t = new Date(p.createdAt).getTime();
      if (t < dayStart || t > dayEnd) continue;
      const amt = money(p.finalAmount);
      if (p.status === "COMPLETED") revenue += amt;
      if (p.status === "COMPLETED") paySum += amt;
      if (p.status === "REFUNDED") refunds += amt;
    }
    points.push({
      date: new Date(dayStart).toISOString(),
      label,
      revenue,
      payments: paySum,
      refunds,
    });
  }
  return points;
}

/** Ingresos completados por tier de plan (precio relativo). */
function buildSegmentSlicesFixed(
  payments: Payment[],
  memberships: Membership[],
  plans: Plan[],
  windowStart: Date,
  windowEnd: Date,
): SegmentSlice[] {
  const planTiers = buildPlanTiers(plans);
  const label: Record<string, string> = {
    enterprise: "Enterprise",
    premium: "Premium",
    corporate: "Corporate",
    basic: "Basic",
    other: "Otros",
  };
  const totals: Record<string, number> = { enterprise: 0, premium: 0, corporate: 0, basic: 0, other: 0 };

  for (const p of payments) {
    if (p.status !== "COMPLETED") continue;
    if (!inWindow(p.createdAt, windowStart, windowEnd)) continue;
    const planId = resolvePlanIdForPayment(p, memberships);
    const tier = planId ? planTiers.get(planId) ?? "basic" : "other";
    const key = tier === "all" ? "other" : tier;
    totals[key] += money(p.finalAmount);
  }

  const keys = (["enterprise", "premium", "corporate", "basic", "other"] as const).filter((k) => (totals[k] ?? 0) > 0);
  if (keys.length === 0) {
    return [
      { id: "na", label: "Sin ingresos", pct: 100, amount: 0, color: SEGMENT_COLORS.other },
    ];
  }
  const sum = keys.reduce((s, k) => s + (totals[k] ?? 0), 0);
  return keys.map((k) => ({
    id: k,
    label: label[k],
    pct: Math.round(((totals[k] ?? 0) / sum) * 1000) / 10,
    amount: Math.round(totals[k] ?? 0),
    color: SEGMENT_COLORS[k],
  }));
}

function buildTopLtv(users: User[], payments: Payment[], memberships: Membership[], plans: Plan[]): TopLtvClient[] {
  const planById = new Map(plans.map((p) => [p.id, p]));
  const userById = new Map(users.map((u) => [u.id, u]));
  const ltv = new Map<string, number>();
  const payCount = new Map<string, number>();

  for (const p of payments) {
    if (p.status !== "COMPLETED") continue;
    const amt = money(p.finalAmount);
    ltv.set(p.userId, (ltv.get(p.userId) ?? 0) + amt);
    payCount.set(p.userId, (payCount.get(p.userId) ?? 0) + 1);
  }

  const sorted = [...ltv.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  return sorted.map(([userId, value], idx) => {
    const u = userById.get(userId);
    const m = memberships.find((x) => x.userId === userId && x.status === "ACTIVE");
    const planName = m ? planById.get(m.planId)?.name ?? "Plan" : "—";
    const tenureMonths = m
      ? Math.max(1, Math.round((Date.now() - new Date(m.startDate).getTime()) / (30 * DAY_MS)))
      : 1;
    const pc = payCount.get(userId) ?? 1;
    const upgradeProbability = Math.min(0.95, 0.15 + pc * 0.06);
    return {
      id: userId,
      rank: idx + 1,
      name: u?.name ?? userId.slice(0, 8),
      plan: planName,
      ltv: Math.round(value),
      tenureMonths,
      upgradeProbability,
    };
  });
}

function buildEventsFromPayments(payments: Payment[], limit = 20): AnalyticsEventItem[] {
  const sorted = [...payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return sorted.slice(0, limit).map((p) => {
    let variant: AnalyticsEventItem["variant"] = "info";
    if (p.status === "COMPLETED") variant = "success";
    else if (p.status === "FAILED") variant = "failed";
    else if (p.status === "REFUNDED") variant = "refund";
    const title =
      p.status === "COMPLETED"
        ? `Pago ${p.method}`
        : p.status === "FAILED"
          ? "Pago fallido"
          : p.status === "REFUNDED"
            ? "Reembolso"
            : `Pago ${p.status}`;
    return {
      id: p.id,
      title,
      subtitle: `Usuario ${p.userId.slice(0, 8)} · ${formatUsd(money(p.finalAmount))}`,
      variant,
      at: p.createdAt,
    };
  });
}

function buildAiInsights(stats: {
  churnPct: number;
  failed: number;
  completed: number;
  cancelledM: number;
  activeM: number;
}): AiInsightItem[] {
  const items: AiInsightItem[] = [];
  if (stats.churnPct >= 8) {
    items.push({
      id: "ai-churn",
      title: "Churn elevado en membresías",
      description: `El ${stats.churnPct.toFixed(1)}% de membresías están canceladas o inactivas frente al total histórico.`,
      priority: "critical",
      tone: "danger",
      ctaLabel: "Ver membresías",
      iconKey: "trendingDown",
    });
  }
  if (stats.failed >= 2) {
    items.push({
      id: "ai-failed",
      title: `${stats.failed} pagos fallidos en el periodo`,
      description: "Revisa métodos de cobro y reintentos. Concentra esfuerzo en recuperación.",
      priority: "high",
      tone: "info",
      ctaLabel: "Revisar cobros",
      iconKey: "creditCard",
    });
  }
  if (stats.completed > 0 && stats.activeM > stats.cancelledM) {
    items.push({
      id: "ai-up",
      title: "Base activa sólida",
      description: "Hay más membresías activas que canceladas: oportunidad de upsell en add-ons.",
      priority: "medium",
      tone: "success",
      ctaLabel: "Ver clientes",
      iconKey: "sparkles",
    });
  }
  if (items.length === 0) {
    items.push({
      id: "ai-ok",
      title: "Operación estable",
      description: "No detectamos señales críticas en pagos y membresías con los datos actuales.",
      priority: "low",
      tone: "violet",
      ctaLabel: "Actualizar vista",
      iconKey: "sparkles",
    });
  }
  return items.slice(0, 5);
}

function buildSmartAlerts(stats: { failed: number; cancelledM: number; pending: number }): SmartAlertSummary[] {
  const rows: SmartAlertSummary[] = [];
  if (stats.failed > 0) rows.push({ id: "sa-f", label: "Pagos fallidos", count: stats.failed, severity: "high" });
  if (stats.cancelledM > 0) rows.push({ id: "sa-c", label: "Membresías canceladas", count: stats.cancelledM, severity: "critical" });
  if (stats.pending > 0) rows.push({ id: "sa-p", label: "Pagos pendientes", count: stats.pending, severity: "medium" });
  if (rows.length === 0) rows.push({ id: "sa-ok", label: "Sin alertas críticas", count: 0, severity: "low" });
  return rows;
}

export function computeInsightsFromApi(input: InsightsApiInput): {
  kpis: KpiMetric[];
  series: FlowSeriesPoint[];
  segments: SegmentSlice[];
  conversion: FunnelStage[];
  behavior: BehaviorFunnelStage[];
  predictions: PredictionMetric[];
  branchForecasts: BranchForecast[];
  events: AnalyticsEventItem[];
  topLtv: TopLtvClient[];
  aiInsights: AiInsightItem[];
  smartAlerts: SmartAlertSummary[];
} {
  const { payments, users, memberships, plans, filters } = input;
  const { start: wStart, days } = getWindow(filters.datePreset);
  const windowEnd = new Date();
  const planTiers = buildPlanTiers(plans);

  const paymentsInWindow = payments.filter((p) => inWindow(p.createdAt, wStart, windowEnd));
  const scoped = paymentsInWindow.filter((p) =>
    paymentMatchesSegment(p, memberships, planTiers, filters.planSegment),
  );

  const completed = scoped.filter((p) => p.status === "COMPLETED");
  const failed = scoped.filter((p) => p.status === "FAILED");
  const refunded = scoped.filter((p) => p.status === "REFUNDED");
  const pending = scoped.filter((p) => p.status === "PENDING");

  const revenueTotal = completed.reduce((s, p) => s + money(p.finalAmount), 0);
  const avgDaily = revenueTotal / Math.max(days, 1);
  const avgWeeklyDisplay = avgDaily * 7;

  const mid = Math.floor(days / 2);
  const firstHalf = completed.filter((p) => new Date(p.createdAt).getTime() < wStart.getTime() + mid * DAY_MS);
  const secondHalf = completed.filter((p) => new Date(p.createdAt).getTime() >= wStart.getTime() + mid * DAY_MS);
  const sum1 = firstHalf.reduce((s, p) => s + money(p.finalAmount), 0);
  const sum2 = secondHalf.reduce((s, p) => s + money(p.finalAmount), 0);
  const revenueDelta = deltaPct(sum1, sum2);

  const uniquePayers = new Set(completed.map((p) => p.userId)).size;
  const activeMemberships = memberships.filter(
    (m) => m.status === "ACTIVE" && new Date(m.endDate).getTime() > Date.now(),
  );
  const activeUsers = new Set(activeMemberships.map((m) => m.userId)).size;
  const activeDelta = deltaPct(Math.max(users.length - activeUsers, 1), activeUsers);

  const totalMemberships = memberships.length || 1;
  const cancelledM = memberships.filter((m) => m.status === "CANCELLED").length;
  const churnPct = (cancelledM / totalMemberships) * 100;
  const retained = memberships.filter((m) => m.status === "ACTIVE" || m.status === "SUSPENDED").length;
  const retentionPct = Math.min(100, (retained / totalMemberships) * 100);

  const membersSet = new Set(memberships.map((m) => m.userId));
  const conversionPct = membersSet.size > 0 ? Math.min(100, (uniquePayers / membersSet.size) * 100) : uniquePayers > 0 ? 100 : 0;

  const ticketAvg = completed.length ? revenueTotal / completed.length : 0;
  const ticketDelta = 0;

  const ltvByUser = new Map<string, number>();
  for (const p of payments) {
    if (p.status !== "COMPLETED") continue;
    ltvByUser.set(p.userId, (ltvByUser.get(p.userId) ?? 0) + money(p.finalAmount));
  }
  const ltvs = [...ltvByUser.values()];
  const avgLtv = ltvs.length ? ltvs.reduce((a, b) => a + b, 0) / ltvs.length : 0;

  const collectionRatio = failed.length ? completed.length / failed.length : completed.length > 0 ? completed.length : 0;

  const dailyBuckets = buildFlowSeriesFromPayments(scoped, wStart, days);
  const sparkRevenue = normalizeSpark(dailyBuckets.map((d) => d.revenue));
  const sparkUsers = normalizeSpark(
    Array.from({ length: days }, (_, i) => {
      const dayStart = wStart.getTime() + i * DAY_MS;
      const dayEnd = dayStart + DAY_MS;
      return completed.filter((p) => {
        const t = new Date(p.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;
    }),
  );

  const kpis: KpiMetric[] = [
    {
      id: "avg_revenue",
      label: "Ingreso semanal equivalente",
      value: formatUsd(avgWeeklyDisplay),
      deltaPct: revenueDelta,
      deltaLabel: "2ª mitad vs 1ª mitad del periodo",
      sparkline: sparkRevenue,
      accent: "violet",
    },
    {
      id: "active_clients",
      label: "Clientes activos",
      value: activeUsers.toLocaleString("es-MX"),
      deltaPct: activeDelta,
      deltaLabel: "vs total usuarios registrados",
      sparkline: sparkUsers,
      accent: "blue",
    },
    {
      id: "retention",
      label: "Retención (membresías)",
      value: `${retentionPct.toFixed(1)}%`,
      deltaPct: 0,
      deltaLabel: "snapshot actual",
      sparkline: normalizeSpark([retentionPct, retentionPct, retentionPct]),
      accent: "teal",
    },
    {
      id: "churn",
      label: "Churn membresías",
      value: `${churnPct.toFixed(1)}%`,
      deltaPct: 0,
      deltaLabel: "canceladas / total",
      sparkline: normalizeSpark([100 - churnPct, 100 - churnPct * 0.9]),
      accent: "orange",
    },
    {
      id: "trial_conversion",
      label: "Conversión a pago",
      value: `${conversionPct.toFixed(1)}%`,
      deltaPct: 0,
      deltaLabel: "pagadores únicos / usuarios con membresía",
      sparkline: normalizeSpark([conversionPct, conversionPct * 0.95]),
      accent: "emerald",
    },
    {
      id: "avg_ticket",
      label: "Ticket promedio",
      value: formatUsd(ticketAvg),
      deltaPct: ticketDelta,
      deltaLabel: "pagos completados en periodo",
      sparkline: normalizeSpark(completed.map((p) => money(p.finalAmount)).slice(-14)),
      accent: "cyan",
    },
    {
      id: "avg_ltv",
      label: "LTV promedio",
      value: formatUsd(avgLtv),
      deltaPct: 0,
      deltaLabel: "histórico por usuario con pagos",
      sparkline: normalizeSpark(ltvs.slice(-14)),
      accent: "violet",
    },
    {
      id: "campaign_roi",
      label: "Ratio cobros / fallos",
      value: `${collectionRatio.toFixed(1)}x`,
      deltaPct: 0,
      deltaLabel: "completados / fallidos (periodo)",
      sparkline: normalizeSpark([collectionRatio * 10, collectionRatio * 12]),
      accent: "amber",
    },
  ];

  const series = buildFlowSeriesFromPayments(scoped, wStart, days);
  const segments = buildSegmentSlicesFixed(scoped, memberships, plans, wStart, windowEnd);

  const newMembersInWindow = memberships.filter((m) => inWindow(m.startDate, wStart, windowEnd)).length;
  const paidUsersInWindow = uniquePayers;
  const leads = users.length || paidUsersInWindow || 1;
  const recoveryCount = countRecoveries(scoped);

  const conversion: FunnelStage[] = [
    { id: "leads", label: "Usuarios registrados", value: leads, pctOfTop: 100, hint: "Base CRM" },
    {
      id: "trial_started",
      label: "Nuevas membresías (periodo)",
      value: newMembersInWindow,
      pctOfTop: Math.round((newMembersInWindow / leads) * 1000) / 10,
      hint: "Inicios en ventana",
    },
    {
      id: "trial_active",
      label: "Membresías activas",
      value: activeMemberships.length,
      pctOfTop: Math.round((activeMemberships.length / Math.max(leads, 1)) * 1000) / 10,
      hint: "Vigentes hoy",
    },
    {
      id: "paid",
      label: "Pagadores en periodo",
      value: paidUsersInWindow,
      pctOfTop: Math.round((paidUsersInWindow / Math.max(leads, 1)) * 1000) / 10,
      hint: "Usuarios únicos",
    },
    {
      id: "cancel",
      label: "Membresías canceladas",
      value: cancelledM,
      pctOfTop: Math.round((cancelledM / Math.max(totalMemberships, 1)) * 1000) / 10,
      hint: "Histórico",
    },
    {
      id: "recovery",
      label: "Recuperación (fallido→ok)",
      value: recoveryCount,
      pctOfTop:
        failed.length > 0
          ? Math.min(100, Math.round((recoveryCount / failed.length) * 1000) / 10)
          : recoveryCount > 0
            ? 100
            : 0,
      hint: "Mismo usuario en periodo",
    },
  ];

  const users2Plus = countUsersWithMultipleCompleted(scoped);
  const behavior: BehaviorFunnelStage[] = [
    { id: "b1", label: "2+ pagos en periodo", value: users2Plus, pct: Math.round((users2Plus / Math.max(uniquePayers, 1)) * 100) },
    {
      id: "b2",
      label: "Usuarios con membresía activa",
      value: activeUsers,
      pct: Math.round((activeUsers / Math.max(users.length, 1)) * 100),
    },
    {
      id: "b3",
      label: "LTV > ticket medio",
      value: ltvs.filter((x) => x > ticketAvg).length,
      pct: Math.round((ltvs.filter((x) => x > ticketAvg).length / Math.max(ltvs.length, 1)) * 100),
    },
    {
      id: "b4",
      label: "Reembolsos en periodo",
      value: refunded.length,
      pct: Math.round((refunded.length / Math.max(scoped.length, 1)) * 100),
    },
  ];

  const dailyAvg = revenueTotal / Math.max(days, 1);
  const projected30 = dailyAvg * 30;
  const prevWindowRevenue = estimatePrevWindowRevenue(payments, wStart, days);
  const projDelta = deltaPct(prevWindowRevenue, projected30);

  const predictions: PredictionMetric[] = [
    { id: "rev", label: "Ingreso estimado (30d)", value: formatUsd(projected30), deltaPct: projDelta, trend: projDelta >= 0 ? "up" : "down" },
    {
      id: "newc",
      label: "Nuevas membresías (30d est.)",
      value: String(Math.max(0, Math.round((newMembersInWindow / Math.max(days, 1)) * 30))),
      deltaPct: 0,
      trend: "flat",
    },
    {
      id: "churnp",
      label: "Churn membresías",
      value: `${churnPct.toFixed(1)}%`,
      deltaPct: 0,
      trend: "flat",
    },
    {
      id: "ticket",
      label: "Ticket promedio estimado",
      value: formatUsd(ticketAvg),
      deltaPct: 0,
      trend: "flat",
    },
    {
      id: "canc_prob",
      label: "Prob. fallo de cobro",
      value: `${scoped.length ? Math.round((failed.length / scoped.length) * 100) : 0}%`,
      deltaPct: 0,
      trend: failed.length > completed.length * 0.1 ? "up" : "down",
    },
  ];

  const branchForecasts: BranchForecast[] = [
    { branch: "Proyección gimnasio", revenue: Math.round(projected30), confidence: 0.78 },
    { branch: "Escenario conservador", revenue: Math.round(projected30 * 0.88), confidence: 0.65 },
  ];

  const events = buildEventsFromPayments(scoped);
  const topLtv = buildTopLtv(users, payments, memberships, plans);
  const aiInsights = buildAiInsights({ churnPct, failed: failed.length, completed: completed.length, cancelledM, activeM: activeMemberships.length });
  const smartAlerts = buildSmartAlerts({ failed: failed.length, cancelledM, pending: pending.length });

  return {
    kpis,
    series,
    segments,
    conversion,
    behavior,
    predictions,
    branchForecasts,
    events,
    topLtv,
    aiInsights,
    smartAlerts,
  };
}

function countUsersWithMultipleCompleted(payments: Payment[]): number {
  const byUser = new Map<string, number>();
  for (const p of payments) {
    if (p.status !== "COMPLETED") continue;
    byUser.set(p.userId, (byUser.get(p.userId) ?? 0) + 1);
  }
  return [...byUser.values()].filter((c) => c >= 2).length;
}

function countRecoveries(payments: Payment[]): number {
  const byUser = new Map<string, Payment[]>();
  for (const p of payments) {
    const list = byUser.get(p.userId) ?? [];
    list.push(p);
    byUser.set(p.userId, list);
  }
  let n = 0;
  for (const [, list] of byUser) {
    const sorted = list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    let hadFail = false;
    for (const p of sorted) {
      if (p.status === "FAILED") hadFail = true;
      else if (p.status === "COMPLETED" && hadFail) {
        n += 1;
        hadFail = false;
      }
    }
  }
  return n;
}

function estimatePrevWindowRevenue(payments: Payment[], currentStart: Date, days: number): number {
  const prevEnd = new Date(currentStart.getTime() - 1);
  const prevStart = startOfDay(new Date(prevEnd.getTime() - (days - 1) * DAY_MS));
  return payments
    .filter((p) => p.status === "COMPLETED" && inWindow(p.createdAt, prevStart, prevEnd))
    .reduce((s, p) => s + money(p.finalAmount), 0);
}
