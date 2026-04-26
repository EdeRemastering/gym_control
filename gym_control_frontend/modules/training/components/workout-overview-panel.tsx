import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNutritionMeals, useNutritionPlans, useRoutineExercises, useRoutines } from "@/hooks/use-zudel-query";
import { useSessionStore } from "@/lib/session-store";
import { useTrainingDerivedData } from "@/modules/training/hooks/use-training-derived-data";
import { useTraining } from "@/modules/training/hooks/use-training";
import { getCurrentWeekDay, mapRoutineExerciseFromApi } from "@/modules/training/services/training-module.utils";
import { useTrainingStore } from "@/modules/training/store/use-training-store";
import { useMemo } from "react";
import { toast } from "sonner";

export function WorkoutOverviewPanel() {
  const currentUser = useSessionStore((state) => state.user);
  const { createWorkoutSession, pendingWorkoutIds } = useTraining();
  const routines = useRoutines();
  const nutritionPlans = useNutritionPlans();

  const {
    selectedRoutineId,
    selectedExerciseId,
    completedSetsByExerciseId,
    routineExercisesByRoutineId,
    selectedWeekDay,
    weeklyRoutineByDay,
    weeklyRoutineMetaByDay,
    weeklyNutritionByDay,
    customNutritionFoods,
    setIsWorkoutMode,
    setTrainingTab,
    setSelectedRoutineId,
    setSelectedWeekDay,
    setNutritionModalDay,
    setNutritionModalSelectedMealId,
    selectedNutritionPlanId,
    setActiveWorkoutSessionId,
  } = useTrainingStore((state) => ({
    selectedRoutineId: state.selectedRoutineId,
    selectedExerciseId: state.selectedExerciseId,
    completedSetsByExerciseId: state.completedSetsByExerciseId,
    routineExercisesByRoutineId: state.routineExercisesByRoutineId,
    selectedWeekDay: state.selectedWeekDay,
    weeklyRoutineByDay: state.weeklyRoutineByDay,
    weeklyRoutineMetaByDay: state.weeklyRoutineMetaByDay,
    weeklyNutritionByDay: state.weeklyNutritionByDay,
    customNutritionFoods: state.customNutritionFoods,
    setIsWorkoutMode: state.setIsWorkoutMode,
    setTrainingTab: state.setTrainingTab,
    setSelectedRoutineId: state.setSelectedRoutineId,
    setSelectedWeekDay: state.setSelectedWeekDay,
    setNutritionModalDay: state.setNutritionModalDay,
    setNutritionModalSelectedMealId: state.setNutritionModalSelectedMealId,
    selectedNutritionPlanId: state.selectedNutritionPlanId,
    setActiveWorkoutSessionId: state.setActiveWorkoutSessionId,
  }));

  const routineExercises = useRoutineExercises(selectedRoutineId || undefined);
  const routineIsFetching = routineExercises.isFetching;
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
  const { sessionExercises, selectedWeekRoutine, selectedWeekNutrition } = useTrainingDerivedData({
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

  const selectedDayLabel = selectedWeekDay.toUpperCase();
  const todayWeekDay = getCurrentWeekDay();
  const todayRoutineId = weeklyRoutineMetaByDay[todayWeekDay]?.routineId ?? "";
  const routineIdForStart = todayRoutineId || selectedRoutineId;
  const canStartSession = Boolean(routineIdForStart) && sessionExercises.length > 0;
  const hasPendingWorkout = pendingWorkoutIds.length > 0;
  const trainingTitle = selectedWeekRoutine?.exercises.length ? "Pierna" : "Sin rutina";
  const topExercises = (selectedWeekRoutine?.exercises ?? []).slice(0, 3);
  const dayMeals = selectedWeekNutrition?.meals ?? [];
  const mealCount = dayMeals.length;
  const dayTotals = dayMeals.reduce(
    (acc, meal) => {
      const kcal = meal.foods.length * 120;
      const protein = meal.foods.length * 8;
      const carbs = meal.foods.length * 10;
      const fats = meal.foods.length * 4;
      return {
        kcal: acc.kcal + kcal,
        protein: acc.protein + protein,
        carbs: acc.carbs + carbs,
        fats: acc.fats + fats,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fats: 0 },
  );

  function openNutritionEditor() {
    setNutritionModalDay(selectedWeekDay);
    const firstMealId = (weeklyNutritionByDay[selectedWeekDay] ?? [])[0]?.id ?? null;
    setNutritionModalSelectedMealId(firstMealId);
  }

  async function onStartWorkout() {
    if (!canStartSession || !currentUser?.id || !routineIdForStart) {
      toast.error("Selecciona una rutina antes de iniciar");
      return;
    }
    // La sesión activa siempre refleja la rutina del día actual.
    setSelectedWeekDay(todayWeekDay);
    if (todayRoutineId && todayRoutineId !== selectedRoutineId) {
      setSelectedRoutineId(todayRoutineId);
    }
    try {
      const created = await createWorkoutSession.mutateAsync({
        userId: currentUser.id,
        routineId: routineIdForStart,
        startedAt: new Date().toISOString(),
      });
      setActiveWorkoutSessionId(created.id);
      setTrainingTab("session");
      setIsWorkoutMode(true);
      toast.success("Sesión iniciada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar sesión");
    }
  }

  return (
    <div className="space-y-4 p-4">
      <Card className="w-full bg-gradient-to-b from-indigo-950/40 to-[#0a1022]">
        <p className="text-[10px] uppercase tracking-[0.22em] text-indigo-200/80">{selectedDayLabel}</p>
        <h3 className="mt-1 text-5xl font-semibold tracking-tight text-white">Tu día</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">Entrena, come, repite. Todo en un vistazo.</p>

        <div className="mt-6 rounded-3xl border border-[var(--border)] bg-white/[0.03] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Entrenamiento</p>
              <p className="mt-2 text-5xl font-semibold text-white">{trainingTitle}</p>
            </div>
            <p className="text-xs font-semibold text-emerald-300">
              {sessionExercises.length * 4} sets · {sessionExercises.length} ej
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {topExercises.length ? (
              topExercises.map((exercise) => (
                <span key={`preview-ex-${exercise.id}`} className="rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                  {exercise.name}
                </span>
              ))
            ) : (
              <span className="text-sm text-[var(--muted)]">No hay ejercicios asignados para este día.</span>
            )}
          </div>
          <Button
            variant="secondary"
            className="mt-5 h-12 rounded-2xl px-6 text-lg font-semibold"
            onClick={onStartWorkout}
            loading={createWorkoutSession.isPending}
            disabled={!canStartSession || routineIsFetching}
          >
            <PlayCircle className="h-5 w-5" />
            {!routineIdForStart
              ? "Selecciona rutina"
              : routineIsFetching
                ? "Cargando ejercicios…"
                : sessionExercises.length === 0
                  ? "Rutina sin ejercicios"
                  : "Iniciar entrenamiento"}
          </Button>
          {hasPendingWorkout ? (
            <p className="mt-2 text-xs text-amber-300">Sincronizando sesión en vivo...</p>
          ) : null}
        </div>

        <div className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Nutrición</p>
              <p className="text-4xl font-semibold text-white">
                {Math.round(dayTotals.kcal)} kcal · {mealCount}/4 comidas
              </p>
            </div>
            <Button variant="ghost" onClick={openNutritionEditor}>
              Editar
            </Button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-white/[0.03] p-4 text-center">
              <p className="text-4xl font-semibold text-white">{Math.round(dayTotals.protein)}g</p>
              <p className="text-xs text-[var(--muted)]">PROTEÍNA</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white/[0.03] p-4 text-center">
              <p className="text-4xl font-semibold text-white">{Math.round(dayTotals.carbs)}g</p>
              <p className="text-xs text-[var(--muted)]">CARBOS</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white/[0.03] p-4 text-center">
              <p className="text-4xl font-semibold text-white">{Math.round(dayTotals.fats)}g</p>
              <p className="text-xs text-[var(--muted)]">GRASAS</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {dayMeals.map((meal) => (
              <div key={`day-meal-${meal.id}`} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/[0.03] px-4 py-3">
                <div>
                  <p className="text-lg font-medium text-white">{meal.label}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {meal.foods.length ? meal.foods.join(" · ") : "Sin alimentos"}
                  </p>
                </div>
                <p className="text-lg font-semibold text-white">{meal.foods.length * 120} kcal</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
