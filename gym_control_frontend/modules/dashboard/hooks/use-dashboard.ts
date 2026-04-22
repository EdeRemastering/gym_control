import { useGyms, useRevenue } from "@/hooks/use-gym-query";

export function useDashboard() {
  return { gymsQuery: useGyms(), revenueQuery: useRevenue() };
}
