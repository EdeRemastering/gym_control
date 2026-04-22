import { useRevenue } from "@/hooks/use-gym-query";

export function useBilling() {
  return { revenueQuery: useRevenue() };
}
