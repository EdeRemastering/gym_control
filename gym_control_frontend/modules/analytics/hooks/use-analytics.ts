import { useRevenue } from "@/hooks/use-zudel-query";

export function useAnalytics() {
  return { revenueQuery: useRevenue() };
}
