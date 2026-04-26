"use client";

import { useTrainingModuleStore } from "@/modules/training/stores/use-training-module-store";
import type { TrainingModuleStore } from "@/modules/training/stores/use-training-module-store";
import { useShallow } from "zustand/react/shallow";

type RoutineBuilderState = Pick<
  TrainingModuleStore,
  | "trainingFocus"
  | "routineForm"
  | "selectedRoutineId"
  | "selectedRoutineBuilderDay"
  | "isRoutineAccordionOpen"
  | "isExerciseFormOpen"
  | "exerciseForm"
  | "editingRoutineExerciseId"
  | "routineExercisesByRoutineId"
  | "selectedRoutineExerciseDetailId"
  | "draggedExerciseMeta"
  | "weeklyRoutineByDay"
  | "trainingModalDay"
  | "trainingModalExerciseId"
  | "setRoutineForm"
  | "setSelectedRoutineId"
  | "setSelectedRoutineBuilderDay"
  | "setIsRoutineAccordionOpen"
  | "setIsExerciseFormOpen"
  | "setExerciseForm"
  | "setEditingRoutineExerciseId"
  | "setRoutineExercisesByRoutineId"
  | "setSelectedRoutineExerciseDetailId"
  | "setDraggedExerciseMeta"
  | "setWeeklyRoutineByDay"
  | "setTrainingModalDay"
  | "setTrainingModalExerciseId"
>;

export function useRoutineBuilderStore<T>(selector: (state: RoutineBuilderState) => T): T {
  return useTrainingModuleStore(useShallow((state: RoutineBuilderState) => selector(state)));
}

