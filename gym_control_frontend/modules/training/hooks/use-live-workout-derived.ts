"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useNutritionMeals, useNutritionPlans, useRoutineExercises, useRoutines } from "@/hooks/use-zudel-query";
import { useTrainingDerivedData } from "@/modules/training/hooks/use-training-derived-data";
import { mapRoutineExerciseFromApi } from "@/modules/training/services/training-module.utils";
import { useTrainingStore } from "@/modules/training/store/use-training-store";

export function useLiveWorkoutDerived() {
  const routines = useRoutines();
  const nutritionPlans = useNutritionPlans();
  const {
    selectedRoutineId,
    routineExercisesByRoutineId,
    selectedWeekDay,
    weeklyRoutineByDay,
    weeklyNutritionByDay,
    completedSetsByExerciseId,
    selectedExerciseId,
    customNutritionFoods,
    activeExerciseIndex,
    selectedNutritionPlanId,
    isWorkoutMode,
    trainingTab,
  } = useTrainingStore(
    useShallow((s) => ({
      selectedRoutineId: s.selectedRoutineId,
      routineExercisesByRoutineId: s.routineExercisesByRoutineId,
      selectedWeekDay: s.selectedWeekDay,
      weeklyRoutineByDay: s.weeklyRoutineByDay,
      weeklyNutritionByDay: s.weeklyNutritionByDay,
      completedSetsByExerciseId: s.completedSetsByExerciseId,
      selectedExerciseId: s.selectedExerciseId,
      customNutritionFoods: s.customNutritionFoods,
      activeExerciseIndex: s.activeExerciseIndex,
      selectedNutritionPlanId: s.selectedNutritionPlanId,
      isWorkoutMode: s.isWorkoutMode,
      trainingTab: s.trainingTab,
    })),
  );

  const routineExercises = useRoutineExercises(selectedRoutineId || undefined);
  const activeNutritionPlanId = useMemo(() => {
    const list = nutritionPlans.data ?? [];
    const first = list[0]?.id;
    if (selectedNutritionPlanId && list.some((p) => p.id === selectedNutritionPlanId)) {
      return selectedNutritionPlanId;
    }
    return first;
  }, [nutritionPlans.data, selectedNutritionPlanId]);
  const nutritionMealsQuery = useNutritionMeals(activeNutritionPlanId);
  const persistedRoutineExercises = useMemo(
    () =>
      (routineExercises.data ?? []).map((item) => {
        const row = mapRoutineExerciseFromApi(item);
        return { id: row.id, name: row.name, reps: row.reps, weight: row.weight, exerciseCatalogId: row.exerciseCatalogId };
      }),
    [routineExercises.data],
  );

  const derived = useTrainingDerivedData({
    selectedRoutineId,
    routines: routines.data ?? [],
    routineExercisesByRoutineId,
    persistedRoutineExercises,
    selectedWeekDay,
    weeklyRoutineByDay,
    weeklyNutritionByDay,
    completedSetsByExerciseId,
    selectedExerciseId,
    nutritionMeals: nutritionMealsQuery.data ?? [],
    customNutritionFoods,
  });

  const focusExercise = derived.sessionExercises[activeExerciseIndex] ?? null;
  const focusExerciseContext = focusExercise ? derived.exerciseContextById[focusExercise.id] : null;
  const nextExerciseInSession = derived.sessionExercises[activeExerciseIndex + 1] ?? null;
  /** Alineado con `TrainingModule`: vista de sesión en vivo (no pestaña Nutrición del modo entreno). */
  const inLiveWorkoutSession = Boolean(isWorkoutMode && trainingTab === "session");

  return {
    ...derived,
    selectedRoutineId,
    completedSetsByExerciseId,
    routineIsFetching: routineExercises.isFetching,
    activeExerciseIndex,
    focusExercise,
    focusExerciseContext,
    nextExerciseInSession,
    inLiveWorkoutSession,
  };
}

