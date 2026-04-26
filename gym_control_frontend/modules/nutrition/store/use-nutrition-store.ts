"use client";

import { useTrainingModuleStore } from "@/modules/training/stores/use-training-module-store";
import type { TrainingModuleStore } from "@/modules/training/stores/use-training-module-store";
import { useShallow } from "zustand/react/shallow";

type NutritionState = Pick<
  TrainingModuleStore,
  | "weeklyNutritionByDay"
  | "customNutritionFoods"
  | "selectedNutritionPlanId"
  | "nutritionModalDay"
  | "nutritionModalSelectedMealId"
  | "nutritionModalFoodDraft"
  | "selectedMealTypeToCreate"
  | "setWeeklyNutritionByDay"
  | "setCustomNutritionFoods"
  | "setSelectedNutritionPlanId"
  | "setNutritionModalDay"
  | "setNutritionModalSelectedMealId"
  | "setNutritionModalFoodDraft"
  | "setSelectedMealTypeToCreate"
>;

export function useNutritionStore<T>(selector: (state: NutritionState) => T): T {
  return useTrainingModuleStore(useShallow((state: NutritionState) => selector(state)));
}
