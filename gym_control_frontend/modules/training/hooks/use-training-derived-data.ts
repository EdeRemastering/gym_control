import { useMemo } from "react";
import { getExerciseContext, MEAL_TYPES, WEEK_DAYS } from "@/modules/training/services/training-module.utils";
import type {
  ExerciseContext,
  RoutineExerciseDraft,
  SessionExercise,
  WeeklyNutritionMeal,
  WeeklyRoutineExercise,
} from "@/modules/training/types/training-module.types";

interface UseTrainingDerivedDataParams {
  selectedRoutineId: string;
  routines: Array<{ id: string; name: string }>;
  routineExercisesByRoutineId: Record<string, RoutineExerciseDraft[]>;
  persistedRoutineExercises: WeeklyRoutineExercise[];
  selectedWeekDay: string;
  weeklyRoutineByDay: Record<string, WeeklyRoutineExercise[]>;
  weeklyNutritionByDay: Record<string, WeeklyNutritionMeal[]>;
  completedSetsByExerciseId: Record<string, number>;
  selectedExerciseId: string | null;
  nutritionMeals: Array<{ id: string; mealType: string; dayOfWeek: number; description: string | null }>;
  customNutritionFoods: string[];
}

export function useTrainingDerivedData({
  selectedRoutineId,
  routines,
  routineExercisesByRoutineId,
  persistedRoutineExercises,
  selectedWeekDay,
  weeklyRoutineByDay,
  weeklyNutritionByDay,
  completedSetsByExerciseId,
  selectedExerciseId,
  nutritionMeals,
  customNutritionFoods,
}: UseTrainingDerivedDataParams) {
  const selectedRoutineExercises = useMemo(
    () => (selectedRoutineId ? (routineExercisesByRoutineId[selectedRoutineId] ?? []) : []),
    [selectedRoutineId, routineExercisesByRoutineId],
  );

  const routineExercisesForPlanning = useMemo(() => {
    const local = selectedRoutineExercises.map((item) => ({
      id: item.id,
      name: item.name,
      reps: item.reps,
      weight: item.weight,
      exerciseCatalogId: item.exerciseCatalogId,
    }));
    return persistedRoutineExercises.length > 0 ? persistedRoutineExercises : local;
  }, [persistedRoutineExercises, selectedRoutineExercises]);

  const sessionExercises = useMemo<SessionExercise[]>(
    () =>
      routineExercisesForPlanning.map((exercise) => ({
        id: exercise.id,
        exercise: exercise.name,
        reps: exercise.reps,
        weight: exercise.weight,
        exerciseCatalogId: exercise.exerciseCatalogId,
      })),
    [routineExercisesForPlanning],
  );

  const exerciseContextById = useMemo<Record<string, ExerciseContext>>(
    () =>
      Object.fromEntries(
        sessionExercises.map((exercise, index) => [
          exercise.id,
          getExerciseContext(exercise.exercise, exercise.reps, exercise.weight, index),
        ]),
      ),
    [sessionExercises],
  );

  const done = sessionExercises.filter((exercise) => {
    const target = exerciseContextById[exercise.id]?.params.sets ?? 4;
    return (completedSetsByExerciseId[exercise.id] ?? 0) >= target;
  }).length;

  const sessionProgress = sessionExercises.length ? Math.round((done / sessionExercises.length) * 100) : 0;
  const totalTargetSets = sessionExercises.reduce((acc, ex) => acc + (exerciseContextById[ex.id]?.params.sets ?? 4), 0);
  const totalCompletedSets = sessionExercises.reduce((acc, ex) => {
    const target = exerciseContextById[ex.id]?.params.sets ?? 4;
    return acc + Math.min(completedSetsByExerciseId[ex.id] ?? 0, target);
  }, 0);
  const seriesProgressPercent =
    totalTargetSets > 0 ? Math.min(100, Math.round((totalCompletedSets / totalTargetSets) * 100)) : 0;

  const selectedRoutineName = useMemo(
    () => routines.find((r) => r.id === selectedRoutineId)?.name ?? "Tu rutina",
    [routines, selectedRoutineId],
  );

  const mealsFromDbByDay = useMemo(() => {
    const typeToLabel: Record<string, string> = {
      BREAKFAST: "Desayuno",
      LUNCH: "Almuerzo",
      DINNER: "Cena",
      SNACK: "Snacks",
      PRE_WORKOUT: "Pre entreno",
      POST_WORKOUT: "Post entreno",
      MIDNIGHT: "Media noche",
    };

    const normalizeDayIndex = (dayOfWeek: number) => {
      if (dayOfWeek >= 1 && dayOfWeek <= 7) return dayOfWeek - 1;
      if (dayOfWeek >= 0 && dayOfWeek <= 6) return dayOfWeek;
      return 0;
    };

    const grouped: Record<string, Array<{ id: string; label: string; foods: string[] }>> = Object.fromEntries(
      WEEK_DAYS.map((day) => [day, []]),
    );

    for (const meal of nutritionMeals) {
      const day = WEEK_DAYS[normalizeDayIndex(meal.dayOfWeek)] ?? WEEK_DAYS[0];
      grouped[day].push({
        id: meal.id,
        label: typeToLabel[meal.mealType] ?? meal.mealType,
        foods: meal.description ? [meal.description] : [],
      });
    }

    return grouped;
  }, [nutritionMeals]);

  const weeklyRoutinePlan = useMemo(
    () =>
      WEEK_DAYS.map((day) => ({
        day,
        exercises: weeklyRoutineByDay[day] ?? [],
      })),
    [weeklyRoutineByDay],
  );

  const weeklyNutritionPlan = useMemo(
    () =>
      WEEK_DAYS.map((day) => ({
        day,
        meals:
          (weeklyNutritionByDay[day] ?? []).length > 0
            ? (weeklyNutritionByDay[day] ?? []).map((mealBlock) => ({
                id: mealBlock.id,
                label: MEAL_TYPES.find((item) => item.value === mealBlock.mealType)?.label ?? mealBlock.mealType,
                foods: mealBlock.foods,
              }))
            : (mealsFromDbByDay[day] ?? []),
      })),
    [mealsFromDbByDay, weeklyNutritionByDay],
  );

  const selectedWeekRoutine = weeklyRoutinePlan.find((item) => item.day === selectedWeekDay);
  const selectedWeekNutrition = weeklyNutritionPlan.find((item) => item.day === selectedWeekDay);
  const selectedNutritionDetail = selectedWeekNutrition ?? { day: selectedWeekDay, meals: [] };

  const nutritionFoodCatalog = useMemo(() => {
    const foodsFromDb = nutritionMeals
      .map((meal) => meal.description?.trim())
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set([...foodsFromDb, ...customNutritionFoods]));
  }, [customNutritionFoods, nutritionMeals]);

  const selectedExercise = sessionExercises.find((exercise) => exercise.id === selectedExerciseId) ?? null;
  const selectedExerciseContext = selectedExercise ? exerciseContextById[selectedExercise.id] : null;

  return {
    selectedRoutineExercises,
    routineExercisesForPlanning,
    sessionExercises,
    exerciseContextById,
    done,
    sessionProgress,
    totalTargetSets,
    totalCompletedSets,
    seriesProgressPercent,
    selectedRoutineName,
    weeklyRoutinePlan,
    weeklyNutritionPlan,
    selectedWeekRoutine,
    selectedWeekNutrition,
    selectedNutritionDetail,
    nutritionFoodCatalog,
    selectedExercise,
    selectedExerciseContext,
  };
}
