import { api } from "@/lib/api/services";

/** Puente hacia API de billing; el hook usa TanStack Query directamente. */
export const financeService = {
  plans: api.plans,
  payments: api.payments,
  revenue: api.revenue,
};
