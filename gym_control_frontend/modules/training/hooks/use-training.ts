import { useTrainingLive } from "@/hooks/use-zudel-query";
import {
  useCreateExerciseLogOptimistic,
  useCreateWorkoutSessionOptimistic,
  useTrainingSyncStore,
} from "@/modules/training/hooks/use-training-optimistic";

export { usePersistWorkoutSet, useFinalizeWorkoutSessionOnServer } from "@/modules/training/hooks/use-training-optimistic";

export function useTraining() {
  return {
    liveQuery: useTrainingLive(),
    createWorkoutSession: useCreateWorkoutSessionOptimistic(),
    createExerciseLog: useCreateExerciseLogOptimistic(),
    pendingWorkoutIds: useTrainingSyncStore((state) => state.pendingWorkoutIds),
  };
}
