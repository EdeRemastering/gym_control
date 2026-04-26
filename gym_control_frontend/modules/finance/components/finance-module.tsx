"use client";

import type { ModuleShellProps } from "@/lib/module-shell-props";
import { PaymentMembershipFlow } from "@/modules/billing/flows/payment-membership-flow";
import { AuditFinancialLog } from "@/modules/finance/components/audit-financial-log";
import { BranchPerformanceTable } from "@/modules/finance/components/branch-performance-table";
import { CashflowChart } from "@/modules/finance/components/cashflow-chart";
import { ConversionMetricsCard } from "@/modules/finance/components/conversion-metrics-card";
import { CreatePlanModal } from "@/modules/finance/components/create-plan-modal";
import { EditPlanModal } from "@/modules/finance/components/edit-plan-modal";
import { FailedPaymentsCard } from "@/modules/finance/components/failed-payments-card";
import { FinanceHeader } from "@/modules/finance/components/finance-header";
import { FinanceInsightsCard } from "@/modules/finance/components/finance-insights-card";
import { FinancialReportsPanel } from "@/modules/finance/components/financial-reports-panel";
import { FinanceRevenueGoalCard } from "@/modules/finance/components/finance-revenue-goal-card";
import { FinanceStatsCards } from "@/modules/finance/components/finance-stats-cards";
import { MembershipFunnel } from "@/modules/finance/components/membership-funnel";
import { PaymentStatusCard } from "@/modules/finance/components/payment-status-card";
import { PlansManagementPanel } from "@/modules/finance/components/plans-management-panel";
import { PricingPlansTable } from "@/modules/finance/components/pricing-plans-table";
import { QuickActionsFinance } from "@/modules/finance/components/quick-actions-finance";
import { RefundPermissionsCard } from "@/modules/finance/components/refund-permissions-card";
import { RegisterPaymentModal } from "@/modules/finance/components/register-payment-modal";
import { RevenueFlowChart } from "@/modules/finance/components/revenue-flow-chart";
import { RevenueForecastCard } from "@/modules/finance/components/revenue-forecast-card";
import { TransactionTimeline } from "@/modules/finance/components/transaction-timeline";
import { useFinanceModule } from "@/modules/finance/hooks/use-finance-module";
import type { ReportKind } from "@/modules/finance/store/use-reports-store";
import { toast } from "sonner";

export function FinanceModule({ role }: ModuleShellProps) {
  const f = useFinanceModule();

  const onReport = (kind: ReportKind) => {
    f.markGenerated(kind);
    toast.success("Reporte encolado. Recibirás el archivo cuando el job termine.");
  };

  return (
    <div className="grid gap-3">
      <FinanceHeader filters={f.filters} onFiltersChange={f.setFilters} onQuickAction={() => f.setRegisterPaymentOpen(true)} />
      <FinanceStatsCards kpis={f.kpis} />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-3">
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RevenueFlowChart points={f.revenuePoints} chartMode={f.chartMode} onChartMode={f.setChartMode} />
            </div>
            <CashflowChart points={f.revenuePoints} />
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <MembershipFunnel stages={f.funnel} />
            <ConversionMetricsCard trialConversion={f.trialConversion} churn={f.churnRate} />
            <div className="space-y-3">
              <FailedPaymentsCard count={f.failedCount} onReview={() => f.setRegisterPaymentOpen(true)} />
              <PaymentStatusCard completed={f.completedPaymentsCount} total={f.totalPaymentsCount} />
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <TransactionTimeline rows={f.transactions} />
            <FinanceInsightsCard items={f.insights} />
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <PlansManagementPanel onCreate={() => f.setCreatePlanOpen(true)} />
            <div className="lg:col-span-2">
              <PricingPlansTable
                plans={f.plans}
                onEdit={(plan) => {
                  f.setEditingPlan(plan);
                  f.setEditPlanOpen(true);
                }}
              />
            </div>
          </div>

          <BranchPerformanceTable rows={f.branchRows} />
        </div>

        <div className="space-y-3">
          <QuickActionsFinance
            onRegisterPayment={() => f.setRegisterPaymentOpen(true)}
            onCreatePlan={() => f.setCreatePlanOpen(true)}
            onReviewFailed={() => toast.message("Abriendo cola de pagos fallidos…")}
          />
          <FinancialReportsPanel lastGenerated={f.lastGenerated} onGenerate={onReport} />
          <RefundPermissionsCard role={role} />
          <FinanceRevenueGoalCard current={f.monthlyRevenue} goal={f.revenueGoal} progressPct={f.revenueProgress} />
          <RevenueForecastCard nextMonthEstimate={f.forecastNext} />
          <AuditFinancialLog rows={f.transactions} />
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,40,0.85),rgba(5,10,24,0.92))] p-4 shadow-lg shadow-black/30 ring-1 ring-cyan-500/10">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Operaciones</p>
        <h3 className="mt-1 text-base font-semibold text-white">Alta de membresía y cobro</h3>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          Flujo conectado a la API: crea membresía y registra el pago en un solo paso (útil para caja o demo E2E).
        </p>
        <div className="mt-4">
          <PaymentMembershipFlow />
        </div>
      </section>

      <CreatePlanModal
        open={f.createPlanOpen}
        onOpenChange={f.setCreatePlanOpen}
        onSubmit={f.onCreatePlan}
        isPending={f.createPlanPending}
      />
      <RegisterPaymentModal
        open={f.registerPaymentOpen}
        onOpenChange={f.setRegisterPaymentOpen}
        users={f.users}
        onSubmit={f.onRegisterPayment}
        isPending={f.createPaymentPending}
      />
      <EditPlanModal
        plan={f.editingPlan}
        open={f.editPlanOpen}
        onOpenChange={(open) => {
          f.setEditPlanOpen(open);
          if (!open) f.setEditingPlan(null);
        }}
        onSubmit={f.onEditPlanSave}
      />
    </div>
  );
}
