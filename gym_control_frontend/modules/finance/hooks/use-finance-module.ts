"use client";

import { useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  RefreshCw,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useCreatePayment, useCreatePlan } from "@/hooks/use-zudel-mutations";
import { useGyms, usePayments, usePlans, useRevenue, useUsers } from "@/hooks/use-zudel-query";
import {
  BRANCH_PERFORMANCE_MOCK,
  DEFAULT_FUNNEL,
  DEFAULT_INSIGHTS,
} from "@/modules/finance/constants/finance.constants";
import {
  buildBranchPerformanceRows,
  buildFinanceInsights,
  buildFunnelStages,
  countFailedPayments,
  countRefundedPayments,
  estimateArr,
  estimateMrrFromPlans,
  paymentsToTransactionRows,
  revenuePointsTotal,
  sumCompletedPayments,
} from "@/modules/finance/selectors/finance.selectors";
import type { CreatePlanForm, EditPlanForm, RegisterPaymentForm } from "@/modules/finance/schemas/finance.schemas";
import { useFinanceStore } from "@/modules/finance/store/use-finance-store";
import { usePaymentsStore } from "@/modules/finance/store/use-payments-store";
import { usePlansStore } from "@/modules/finance/store/use-plans-store";
import { useReportsStore } from "@/modules/finance/store/use-reports-store";
import { useRevenueStore } from "@/modules/finance/store/use-revenue-store";
import type { FinanceKpi } from "@/modules/finance/types/finance.types";
import { toast } from "sonner";
export function useFinanceModule() {
  const paymentsQuery = usePayments();
  const plansQuery = usePlans();
  const revenueQuery = useRevenue();
  const usersQuery = useUsers();
  const gymsQuery = useGyms();
  const createPlan = useCreatePlan();
  const createPayment = useCreatePayment();

  const finance = useFinanceStore(
    useShallow((s) => ({
      filters: s.filters,
      createPlanOpen: s.createPlanOpen,
      editPlanOpen: s.editPlanOpen,
      registerPaymentOpen: s.registerPaymentOpen,
      setFilters: s.setFilters,
      setCreatePlanOpen: s.setCreatePlanOpen,
      setEditPlanOpen: s.setEditPlanOpen,
      setRegisterPaymentOpen: s.setRegisterPaymentOpen,
    })),
  );

  const hiddenPaymentIds = usePaymentsStore((s) => s.hiddenPaymentIds);

  const { editingPlan, setEditingPlan } = usePlansStore(
    useShallow((s) => ({ editingPlan: s.editingPlan, setEditingPlan: s.setEditingPlan })),
  );

  const { chartMode, setChartMode } = useRevenueStore(
    useShallow((s) => ({ chartMode: s.chartMode, setChartMode: s.setChartMode })),
  );

  const { lastGenerated, markGenerated } = useReportsStore(
    useShallow((s) => ({ lastGenerated: s.lastGenerated, markGenerated: s.markGenerated })),
  );

  const payments = useMemo(() => paymentsQuery.data ?? [], [paymentsQuery.data]);
  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const points = useMemo(() => revenueQuery.data ?? [], [revenueQuery.data]);
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const gyms = useMemo(() => gymsQuery.data ?? [], [gymsQuery.data]);

  const userNames = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u.name] as const)),
    [users],
  );

  const hiddenSet = useMemo(() => new Set(hiddenPaymentIds), [hiddenPaymentIds]);

  const activeClientHint = (gymsQuery.data?.[0]?.members ?? 120) + users.length;

  const metrics = useMemo(() => {
    const completedSum = sumCompletedPayments(payments);
    const revenueTotal = revenuePointsTotal(points) || completedSum;
    const mrr = estimateMrrFromPlans(plans, activeClientHint);
    const arr = estimateArr(mrr);
    const failed = countFailedPayments(payments);
    const refunds = countRefundedPayments(payments);
    const avgTicket =
      payments.filter((p) => p.status === "COMPLETED").length > 0
        ? completedSum / payments.filter((p) => p.status === "COMPLETED").length
        : 48.6;
    const churn = 3.9;
    const trialConversion = 64;
    return {
      mrr,
      arr,
      monthlyRevenue: revenueTotal,
      failed,
      refunds,
      avgTicket,
      churn,
      trialConversion,
      activeClients: activeClientHint,
    };
  }, [payments, plans, points, activeClientHint]);

  const kpis: FinanceKpi[] = useMemo(
    () => [
      {
        id: "mrr",
        label: "MRR activo",
        value: `$${metrics.mrr.toLocaleString()}`,
        delta: "+8.4% vs semana anterior",
        deltaPositive: true,
        icon: Wallet,
        tone: "text-fuchsia-300",
      },
      {
        id: "arr",
        label: "ARR estimado",
        value: `$${metrics.arr.toLocaleString()}`,
        delta: "+12.1% vs año anterior",
        deltaPositive: true,
        icon: TrendingUp,
        tone: "text-violet-300",
      },
      {
        id: "month",
        label: "Ingresos del mes",
        value: `$${Math.round(metrics.monthlyRevenue).toLocaleString()}`,
        delta: "+15.3% vs mes anterior",
        deltaPositive: true,
        icon: CreditCard,
        tone: "text-cyan-300",
      },
      {
        id: "churn",
        label: "Churn rate",
        value: `${metrics.churn}%`,
        delta: "-0.6% vs mes anterior",
        deltaPositive: true,
        icon: ArrowDownRight,
        tone: "text-rose-300",
      },
      {
        id: "conv",
        label: "Conversión trial → pago",
        value: `${metrics.trialConversion}%`,
        delta: "+5.1% vs mes anterior",
        deltaPositive: true,
        icon: Zap,
        tone: "text-emerald-300",
      },
      {
        id: "failed",
        label: "Pagos fallidos",
        value: String(metrics.failed),
        delta: metrics.failed > 0 ? "Requiere revisión" : "Sin pendientes",
        deltaPositive: metrics.failed === 0,
        icon: RefreshCw,
        tone: "text-amber-300",
      },
      {
        id: "refunds",
        label: "Reembolsos",
        value: String(metrics.refunds),
        delta: "Periodo actual",
        deltaPositive: true,
        icon: ArrowDownRight,
        tone: "text-orange-300",
      },
      {
        id: "ticket",
        label: "Ticket promedio",
        value: `$${metrics.avgTicket.toFixed(2)}`,
        delta: "+9.8% vs mes anterior",
        deltaPositive: true,
        icon: ArrowUpRight,
        tone: "text-purple-300",
      },
    ],
    [metrics],
  );

  const transactions = useMemo(
    () => paymentsToTransactionRows(payments, userNames, hiddenSet),
    [payments, userNames, hiddenSet],
  );

  const funnel = useMemo(
    () => buildFunnelStages(users.length, payments, DEFAULT_FUNNEL),
    [users.length, payments],
  );

  const insights = useMemo(
    () =>
      buildFinanceInsights(
        {
          failed: metrics.failed,
          refunds: metrics.refunds,
          mrr: metrics.mrr,
          plansCount: plans.length,
          usersCount: users.length,
          monthlyRevenue: metrics.monthlyRevenue,
          paymentsCount: payments.length,
        },
        DEFAULT_INSIGHTS,
      ),
    [
      metrics.failed,
      metrics.refunds,
      metrics.mrr,
      metrics.monthlyRevenue,
      plans.length,
      users.length,
      payments.length,
    ],
  );

  const branchRows = useMemo(
    () =>
      buildBranchPerformanceRows(metrics.monthlyRevenue, payments, users, gyms, BRANCH_PERFORMANCE_MOCK),
    [metrics.monthlyRevenue, payments, users, gyms],
  );

  const revenueGoal = 150_000;
  const revenueProgress = Math.min(100, Math.round((metrics.monthlyRevenue / revenueGoal) * 100));

  const completedCount = payments.filter((p) => p.status === "COMPLETED").length;

  async function onCreatePlan(data: CreatePlanForm) {
    await createPlan.mutateAsync({
      name: data.name,
      duration: data.duration,
      price: data.price,
    });
    finance.setCreatePlanOpen(false);
    toast.success("Plan creado correctamente");
  }

  async function onRegisterPayment(data: RegisterPaymentForm) {
    await createPayment.mutateAsync({
      userId: data.userId,
      amount: data.amount,
      finalAmount: data.amount,
      method: data.method,
      status: "COMPLETED",
    });
    finance.setRegisterPaymentOpen(false);
    toast.success("Pago registrado");
  }

  function onEditPlanSave(data: EditPlanForm) {
    finance.setEditPlanOpen(false);
    setEditingPlan(null);
    toast.message(`Borrador guardado para "${data.name}". Conecta PATCH /plans/:id cuando esté disponible.`);
  }

  return {
    ...finance,
    chartMode,
    setChartMode,
    kpis,
    revenuePoints: points,
    plans,
    payments,
    users,
    transactions,
    funnel,
    insights,
    branchRows,
    editingPlan,
    setEditingPlan,
    lastGenerated,
    markGenerated,
    revenueGoal,
    revenueProgress,
    monthlyRevenue: metrics.monthlyRevenue,
    failedCount: metrics.failed,
    trialConversion: metrics.trialConversion,
    churnRate: metrics.churn,
    forecastNext: `$${Math.round(metrics.mrr * 1.08).toLocaleString()}`,
    completedPaymentsCount: completedCount,
    totalPaymentsCount: payments.length,
    isLoading: paymentsQuery.isLoading || plansQuery.isLoading,
    createPlanPending: createPlan.isPending,
    createPaymentPending: createPayment.isPending,
    onCreatePlan,
    onRegisterPayment,
    onEditPlanSave,
  };
}
