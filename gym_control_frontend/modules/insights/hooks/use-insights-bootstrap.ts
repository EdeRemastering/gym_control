"use client";

import { useEffect, useMemo } from "react";
import { useMemberships, usePayments, usePlans, useUsers } from "@/hooks/use-zudel-query";
import { hydrateAllInsightStores } from "@/modules/insights/services/insights-hydration.service";
import { useInsightsFiltersStore } from "@/modules/insights/store/use-insights-filters-store";
import { useInsightsKpiStore } from "@/modules/insights/store/use-insights-kpi-store";

/**
 * Hidrata los stores del laboratorio desde datos reales (pagos, usuarios, membresías, planes).
 */
export function useInsightsBootstrap() {
  const payments = usePayments();
  const users = useUsers();
  const memberships = useMemberships();
  const plans = usePlans();

  const datePreset = useInsightsFiltersStore((s) => s.datePreset);
  const branchId = useInsightsFiltersStore((s) => s.branchId);
  const planSegment = useInsightsFiltersStore((s) => s.planSegment);
  const markApplied = useInsightsFiltersStore((s) => s.markApplied);

  const apiPayload = useMemo(
    () => ({
      payments: payments.data ?? [],
      users: users.data ?? [],
      memberships: memberships.data ?? [],
      plans: plans.data ?? [],
    }),
    [payments.data, users.data, memberships.data, plans.data],
  );

  const isQueryLoading =
    payments.isLoading || users.isLoading || memberships.isLoading || plans.isLoading;

  const anyError =
    payments.isError || users.isError || memberships.isError || plans.isError;

  useEffect(() => {
    hydrateAllInsightStores(apiPayload, { branchId, planSegment, datePreset });
    useInsightsKpiStore.getState().setError(
      anyError ? "No se pudieron cargar algunos datos. Revisa la conexión o permisos." : null,
    );
    markApplied();
  }, [apiPayload, anyError, branchId, datePreset, markApplied, planSegment]);

  return {
    isQueryLoading,
    isFetching:
      payments.isFetching || users.isFetching || memberships.isFetching || plans.isFetching,
  };
}
