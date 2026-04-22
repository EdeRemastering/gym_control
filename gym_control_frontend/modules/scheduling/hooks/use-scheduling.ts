import { useSchedule } from "@/hooks/use-gym-query";

export function useScheduling() {
  return { scheduleQuery: useSchedule() };
}
