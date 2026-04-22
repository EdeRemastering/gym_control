import { useRevenue } from "@/hooks/use-gym-query";

export function useAnalytics() {
  return { revenueQuery: useRevenue() };
}
