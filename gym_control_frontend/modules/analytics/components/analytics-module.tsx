"use client";

import { ActivitySquare, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useActivities, useCheckins, usePayments, useRevenue } from "@/hooks/use-gym-query";
import type { ModuleShellProps } from "@/lib/module-shell-props";
import { AnalyticsFlow } from "@/modules/analytics/flows/analytics-flow";

export function AnalyticsModule({ role }: ModuleShellProps) {
  const revenue = useRevenue();
  const payments = usePayments();
  const checkins = useCheckins();
  const activities = useActivities();
  const trend = revenue.data ?? [];
  const avg =
    trend.length > 0
      ? Math.round(trend.reduce((sum, point) => sum + point.value, 0) / trend.length)
      : 0;
  const completedPayments = (payments.data ?? []).filter((payment) => payment.status === "COMPLETED").length;
  const checkinCount = (checkins.data ?? []).length;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <div className="flex items-center gap-2 text-white">
          <TrendingUp className="h-4 w-4 text-[var(--secondary)]" />
          Ingreso promedio
        </div>
        <p className="mt-3 text-3xl font-semibold text-white">${avg}</p>
      </Card>

      <Card className="lg:col-span-2">
        <div className="flex items-center gap-2 text-white">
          <ActivitySquare className="h-4 w-4 text-[var(--primary)]" />
          Insights de rendimiento
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <div className="rounded-xl bg-white/5 p-3 text-sm text-white">
            Pagos completados: {completedPayments}
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-sm text-white">
            Check-ins registrados: {checkinCount}
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-sm text-white">
            Actividad reciente: {(activities.data ?? []).length}
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">Vista optimizada para rol {role}.</p>
      </Card>

      <div className="lg:col-span-3">
        <AnalyticsFlow />
      </div>
    </div>
  );
}
