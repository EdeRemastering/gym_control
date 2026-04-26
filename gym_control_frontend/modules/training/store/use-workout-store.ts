"use client";

import { useTrainingModuleStore } from "@/modules/training/stores/use-training-module-store";
import type { TrainingModuleStore } from "@/modules/training/stores/use-training-module-store";
import { useShallow } from "zustand/react/shallow";

type WorkoutState = Pick<
  TrainingModuleStore,
  | "activeWorkoutSessionId"
  | "exerciseLogIdByCatalogExerciseId"
  | "sessionClosed"
  | "isWorkoutMode"
  | "activeExerciseIndex"
  | "restSeconds"
  | "restInitialTotal"
  | "isRestRunning"
  | "isRestPaused"
  | "sessionElapsedSeconds"
  | "quickSet"
  | "completedSetsByExerciseId"
  | "setRowDrafts"
  | "selectedExerciseId"
  | "setActiveWorkoutSessionId"
  | "setExerciseLogIdForCatalog"
  | "setSessionClosed"
  | "setIsWorkoutMode"
  | "setActiveExerciseIndex"
  | "setRestSeconds"
  | "setRestInitialTotal"
  | "setIsRestRunning"
  | "setIsRestPaused"
  | "setSessionElapsedSeconds"
  | "setQuickSet"
  | "setCompletedSetsByExerciseId"
  | "setSetRowDrafts"
  | "setSelectedExerciseId"
>;

export function useWorkoutStore<T>(selector: (state: WorkoutState) => T): T {
  return useTrainingModuleStore(useShallow((state: WorkoutState) => selector(state)));
}

