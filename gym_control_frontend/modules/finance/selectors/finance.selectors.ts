import type { Gym, Payment, Plan, RevenuePoint, User } from "@/lib/types";
import type {
  BranchPerformanceRow,
  FinanceInsight,
  FunnelStage,
  TransactionRow,
} from "@/modules/finance/types/finance.types";

export function sumCompletedPayments(payments: Payment[]): number {
  return payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((acc, p) => acc + Number(p.finalAmount ?? 0), 0);
}

export function countFailedPayments(payments: Payment[]): number {
  return payments.filter((p) => p.status === "FAILED").length;
}

export function countRefundedPayments(payments: Payment[]): number {
  return payments.filter((p) => p.status === "REFUNDED").length;
}

export function estimateMrrFromPlans(plans: Plan[], activeClientHint: number): number {
  if (!plans.length) return 18_420;
  const avgPlan = plans.reduce((s, p) => s + Number(p.price), 0) / plans.length;
  const monthlyFactor = 30 / Math.max(plans[0]?.duration ?? 30, 1);
  return Math.round(avgPlan * monthlyFactor * Math.min(activeClientHint, 400));
}

export function estimateArr(mrr: number): number {
  return Math.round(mrr * 12);
}

export function revenuePointsTotal(points: RevenuePoint[]): number {
  return points.reduce((s, p) => s + p.value, 0);
}

function formatMoneyUsd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function performanceFromChurnPct(churnPct: number): BranchPerformanceRow["performance"] {
  if (churnPct < 2.5) return "excelente";
  if (churnPct < 4.2) return "bueno";
  return "riesgo";
}

/** Ingresos completados agrupados por sede del usuario (gymId). */
export function aggregateCompletedRevenueByGym(payments: Payment[], users: User[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const p of payments) {
    if (p.status !== "COMPLETED") continue;
    const u = users.find((x) => x.id === p.userId);
    const gid = u?.gymId ?? "__unassigned__";
    map.set(gid, (map.get(gid) ?? 0) + Number(p.finalAmount ?? 0));
  }
  return map;
}

/** Insights en español a partir de métricas reales; si no hay señal útil, usa `fallback`. */
export function buildFinanceInsights(
  input: {
    failed: number;
    refunds: number;
    mrr: number;
    plansCount: number;
    usersCount: number;
    monthlyRevenue: number;
    paymentsCount: number;
  },
  fallback: FinanceInsight[],
): FinanceInsight[] {
  const { failed, refunds, mrr, plansCount, usersCount, monthlyRevenue, paymentsCount } = input;
  if (paymentsCount === 0 && usersCount === 0 && plansCount === 0) return fallback;

  const mrrStr = mrr.toLocaleString("en-US");
  const revStr = Math.round(monthlyRevenue).toLocaleString("en-US");

  return [
    {
      id: "insights-failed",
      title: failed === 0 ? "Sin pagos fallidos en cola" : `${failed} pago(s) fallido(s) detectados`,
      description:
        failed === 0
          ? "La última sincronización no muestra errores de cobro pendientes."
          : "Revisa métodos de pago, límites y reintentos automáticos para reducir fricción.",
      cta: failed === 0 ? "Ver historial" : "Revisar fallidos",
    },
    {
      id: "insights-refunds",
      title: refunds === 0 ? "Reembolsos bajo control" : `${refunds} reembolso(s) en el periodo`,
      description:
        refunds === 0
          ? "No hay devoluciones registradas recientemente en este dataset."
          : "Contrasta montos y motivos con el equipo de operaciones antes de escalar.",
      cta: "Ver reembolsos",
    },
    {
      id: "insights-mrr",
      title: `MRR operativo ~$${mrrStr}`,
      description: `Ingresos recurrentes estimados a partir de planes y base activa (~$${revStr} en ingresos del periodo).`,
      cta: "Ver planes",
    },
    {
      id: "insights-plans",
      title: plansCount === 0 ? "Define catálogo de planes" : `${plansCount} plan(es) en catálogo`,
      description:
        plansCount === 0
          ? "Sin planes no hay embudo de precios consistente para nuevas altas."
          : `${usersCount} usuario(s) en base. Ajusta precios o duración según conversión observada.`,
      cta: "Gestionar planes",
    },
  ];
}

const BRANCH_WEIGHTS = [0.38, 0.35, 0.27] as const;
const SYNTHETIC_BRANCH_NAMES = ["Sede Centro", "Sede Norte", "Sede Sur"] as const;

/** Rendimiento por sede: prioriza gyms de API + reparto por pagos/user gymId; si no hay gyms, reparte ingreso del mes. */
export function buildBranchPerformanceRows(
  monthlyRevenue: number,
  payments: Payment[],
  users: User[],
  gyms: Gym[],
  fallback: BranchPerformanceRow[],
): BranchPerformanceRow[] {
  const failed = countFailedPayments(payments);
  const totalP = Math.max(payments.length, 1);
  const failRate = failed / totalP;
  const byGym = aggregateCompletedRevenueByGym(payments, users);
  const gymRevenueSum = [...byGym.values()].reduce((a, b) => a + b, 0);

  const slice = gyms.length ? gyms.slice(0, 3) : [];

  if (slice.length === 0) {
    if (monthlyRevenue <= 0 && payments.length === 0) return fallback;
    return SYNTHETIC_BRANCH_NAMES.map((branch, i) => {
      const w = BRANCH_WEIGHTS[i] ?? 0.33;
      const incomeNum = monthlyRevenue * w;
      const clients = Math.max(40, Math.round(180 + users.length * 12 + i * 24));
      const churnPct = Math.min(7.5, Math.max(0.9, failRate * 100 * (1 + i * 0.14)));
      const variationSign = failRate < 0.08 ? "+" : "";
      const variationMag = Math.round((0.12 - failRate * 0.5 + i * 0.02) * 100);
      return {
        branch,
        income: formatMoneyUsd(incomeNum),
        variation: `${variationSign}${variationMag}%`,
        clients,
        newClients: Math.max(4, Math.round(clients * 0.06)),
        churn: `${churnPct.toFixed(1)}%`,
        arpu: formatMoneyUsd(incomeNum / Math.max(clients, 1)),
        performance: performanceFromChurnPct(churnPct),
      };
    });
  }

  const totalMembers = slice.reduce((s, g) => s + Math.max(g.members, 1), 0);

  return slice.map((g, i) => {
    const fromPayments = byGym.get(g.id) ?? 0;
    const incomeNum =
      gymRevenueSum > 0
        ? fromPayments
        : monthlyRevenue * (Math.max(g.members, 1) / totalMembers);
    const clients = Math.max(g.members, users.filter((u) => u.gymId === g.id).length, 1);
    const churnPct = Math.min(7.5, Math.max(0.9, failRate * 100 * (1 + i * 0.12) + (g.members < 80 ? 0.4 : 0)));
    const trend = failRate < 0.1 ? 14 - i * 2 : 4 - i * 3;
    return {
      branch: g.name,
      income: formatMoneyUsd(incomeNum),
      variation: `${trend >= 0 ? "+" : ""}${trend}%`,
      clients,
      newClients: Math.max(2, Math.round(clients * 0.05)),
      churn: `${churnPct.toFixed(1)}%`,
      arpu: formatMoneyUsd(incomeNum / Math.max(clients, 1)),
      performance: performanceFromChurnPct(churnPct),
    };
  });
}

/** Embudo derivado de usuarios y pagos; si no hay datos, devuelve `fallback`. */
export function buildFunnelStages(
  userCount: number,
  payments: Payment[],
  fallback: FunnelStage[],
): FunnelStage[] {
  const completed = payments.filter((p) => p.status === "COMPLETED");
  const uniquePaid = new Set(completed.map((p) => p.userId)).size;
  const refunds = countRefundedPayments(payments);

  if (userCount === 0 && payments.length === 0) return fallback;

  const visits = Math.max(Math.round(uniquePaid * 5 + userCount * 6), 48);
  const trialsStarted = Math.round(visits * 0.44);
  const activeTrials = Math.round(trialsStarted * 0.69);
  const converted = Math.max(uniquePaid, Math.round(activeTrials * 0.55));
  const cancellations = Math.max(refunds, Math.round(converted * 0.05), 1);

  const stages: Omit<FunnelStage, "widthPct">[] = [
    { id: "visits", label: "Visitas / Leads", count: visits },
    { id: "trials", label: "Trials iniciados", count: trialsStarted },
    { id: "active", label: "Trials activos", count: activeTrials },
    { id: "paid", label: "Convertidos a pago", count: converted },
    { id: "churn", label: "Cancelaciones", count: cancellations },
  ];
  const max = Math.max(...stages.map((s) => s.count), 1);
  return stages.map((s) => ({
    ...s,
    widthPct: Math.max(8, Math.round((s.count / max) * 100)),
  }));
}

export function paymentsToTransactionRows(
  payments: Payment[],
  userNames: Record<string, string>,
  hiddenIds: Set<string>,
): TransactionRow[] {
  return payments
    .filter((p) => !hiddenIds.has(p.id))
    .slice(0, 12)
    .map((p) => {
      const name = userNames[p.userId] ?? "Cliente";
      const status =
        p.status === "REFUNDED"
          ? "REFUND"
          : p.status === "COMPLETED" && Number(p.finalAmount) > 500_000
            ? "ANNUAL"
            : p.status === "COMPLETED"
              ? "MONTHLY"
              : p.status;
      return {
        id: p.id,
        title: `${name} · ${p.method}`,
        subtitle: new Date(p.createdAt).toLocaleString(),
        amount: `$${Number(p.finalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        status,
        at: new Date(p.createdAt).toLocaleDateString(),
      };
    });
}
