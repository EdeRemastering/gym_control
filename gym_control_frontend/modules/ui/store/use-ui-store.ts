"use client";

import { useTrainingModuleStore } from "@/modules/training/stores/use-training-module-store";
import type { TrainingModuleStore } from "@/modules/training/stores/use-training-module-store";
import { useShallow } from "zustand/react/shallow";

type UIState = Pick<
  TrainingModuleStore,
  | "trainingTab"
  | "trainingFocus"
  | "planningScope"
  | "selectedWeekDay"
  | "isRoutineAccordionOpen"
  | "isNutritionAccordionOpen"
  | "selectedExerciseId"
  | "selectedRoutineExerciseDetailId"
  | "setTrainingTab"
  | "setTrainingFocus"
  | "setPlanningScope"
  | "setSelectedWeekDay"
  | "setIsRoutineAccordionOpen"
  | "setIsNutritionAccordionOpen"
  | "setSelectedExerciseId"
  | "setSelectedRoutineExerciseDetailId"
>;

export function useUIStore<T>(selector: (state: UIState) => T): T {
  return useTrainingModuleStore(useShallow((state: UIState) => selector(state)));
}
