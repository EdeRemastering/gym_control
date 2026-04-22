import { useTrainingLive } from "@/hooks/use-gym-query";

export function useTraining() {
  return { liveQuery: useTrainingLive() };
}
