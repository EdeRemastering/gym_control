import { useRevenue } from "@/hooks/use-zudel-query";

export function useBilling() {
  return { revenueQuery: useRevenue() };
}
