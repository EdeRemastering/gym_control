import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { useUserRoutines } from "@/hooks/use-zudel-query";
import { useLiveWorkoutDerived } from "@/modules/training/hooks/use-live-workout-derived";
import { WEEK_DAYS } from "@/modules/training/services/training-module.utils";
import { useTrainingStore } from "@/modules/training/store/use-training-store";

export function TrainingPlanningScopePanel() {
  const {
    planningScope,
    setPlanningScope,
    selectedWeekDay,
    setSelectedWeekDay,
    trainingFocus,
    weeklyRoutineByDay,
    setWeeklyRoutineByDay,
    weeklyRoutineMetaByDay,
    setWeeklyRoutineMetaByDay,
    weeklyNutritionByDay,
    setTrainingModalDay,
    setTrainingModalExerciseId,
    setNutritionModalDay,
    setNutritionModalSelectedMealId,
  } = useTrainingStore((state) => ({
    planningScope: state.planningScope,
    setPlanningScope: state.setPlanningScope,
    selectedWeekDay: state.selectedWeekDay,
    setSelectedWeekDay: state.setSelectedWeekDay,
    trainingFocus: state.trainingFocus,
    weeklyRoutineByDay: state.weeklyRoutineByDay,
    setWeeklyRoutineByDay: state.setWeeklyRoutineByDay,
    weeklyRoutineMetaByDay: state.weeklyRoutineMetaByDay,
    setWeeklyRoutineMetaByDay: state.setWeeklyRoutineMetaByDay,
    weeklyNutritionByDay: state.weeklyNutritionByDay,
    setTrainingModalDay: state.setTrainingModalDay,
    setTrainingModalExerciseId: state.setTrainingModalExerciseId,
    setNutritionModalDay: state.setNutritionModalDay,
    setNutritionModalSelectedMealId: state.setNutritionModalSelectedMealId,
  }));
  const userRoutinesQuery = useUserRoutines();
  const {
    routineExercisesForPlanning,
    selectedNutritionDetail,
    weeklyRoutinePlan,
    selectedWeekRoutine,
    selectedWeekNutrition,
  } = useLiveWorkoutDerived();

  function openTrainingDayModal(day: string) {
    setTrainingModalDay(day);
    const firstExerciseId = (weeklyRoutineByDay[day] ?? [])[0]?.id ?? "";
    setTrainingModalExerciseId(firstExerciseId);
  }

  function openNutritionDayModal(day: string) {
    setSelectedWeekDay(day);
    setNutritionModalDay(day);
    const firstMealId = (weeklyNutritionByDay[day] ?? [])[0]?.id ?? null;
    setNutritionModalSelectedMealId(firstMealId);
  }

  function viewNutritionDay(day: string) {
    setSelectedWeekDay(day);
  }

  useEffect(() => {
    if (!userRoutinesQuery.data?.length) return;
    const dayMap = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;
    const nextMeta: Record<string, { routineId: string; routineName: string; exerciseCount: number }> = {};
    const nextWeek: Record<string, Array<{ id: string; name: string; reps: number; weight: number }>> = {};

    for (const assignment of userRoutinesQuery.data) {
      const dayLabel = dayMap[new Date(assignment.startDate).getDay()] ?? "Lunes";
      if (nextMeta[dayLabel]) continue;
      const mappedExercises = (assignment.routine.exercises ?? []).map((item) => ({
        id: item.id,
        name: item.exercise?.name ?? "Ejercicio",
        reps: item.reps,
        weight: Number(item.weight ?? 0),
      }));
      nextWeek[dayLabel] = mappedExercises;
      nextMeta[dayLabel] = {
        routineId: assignment.routineId,
        routineName: assignment.routine.name,
        exerciseCount: mappedExercises.length,
      };
    }

    setWeeklyRoutineByDay((prev) => ({ ...nextWeek, ...prev }));
    setWeeklyRoutineMetaByDay((prev) => ({ ...nextMeta, ...prev }));
  }, [setWeeklyRoutineByDay, setWeeklyRoutineMetaByDay, userRoutinesQuery.data]);

  return (
    <div className="border-b border-[var(--border)] bg-black/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
          {trainingFocus === "nutrition" ? "Resumen nutricional" : "Resumen de entreno"}
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={planningScope === "day" ? "secondary" : "ghost"} onClick={() => setPlanningScope("day")}>
            Hoy
          </Button>
          <Button size="sm" variant={planningScope === "week" ? "secondary" : "ghost"} onClick={() => setPlanningScope("week")}>
            Semana
          </Button>
        </div>
      </div>

      {planningScope === "day" ? (
        <div className="mt-3 grid gap-3 lg:grid-cols-1">
          {trainingFocus === "training" ? (
            <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
              <p className="text-xs text-[var(--muted)]">Rutina de hoy</p>
              {routineExercisesForPlanning.length ? (
                <div className="mt-2 space-y-1">
                  {routineExercisesForPlanning.slice(0, 6).map((exercise) => (
                    <p key={`day-routine-${exercise.id}`} className="text-sm text-white">
                      {exercise.name} · {exercise.reps} reps
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-[var(--muted)]">Selecciona una rutina y agrega ejercicios para ver el plan del día.</p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
              <p className="text-xs text-[var(--muted)]">Nutrición de {selectedWeekDay}</p>
              <div className="mt-2 space-y-1">
                {selectedNutritionDetail.meals.length ? (
                  selectedNutritionDetail.meals.map((meal) => (
                    <p key={`day-nutrition-${meal.id}`} className="text-sm text-white">
                      {meal.label}: {meal.foods[0] ?? "Sin alimento definido"}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-[var(--muted)]">Sin comidas. Abre Semana y edita con el lápiz o usa Editar dieta al costado.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 lg:grid-cols-1">
            {trainingFocus === "training" ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-[var(--muted)]">Rutina por semana (ver o editar)</p>
                    <button
                      type="button"
                      className="rounded-md border border-[var(--border)] bg-black/20 px-2 py-1 text-xs text-white hover:bg-white/10"
                      onClick={() => openTrainingDayModal(selectedWeekDay)}
                    >
                      Editar {selectedWeekDay}
                    </button>
                  </div>
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-full text-left text-xs text-white">
                      <thead>
                        <tr>
                          {WEEK_DAYS.map((day) => (
                            <th key={`planning-training-head-${day}`} className="px-2 py-1 font-medium text-[var(--muted)]">
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {WEEK_DAYS.map((day) => (
                            <td key={`planning-training-cell-${day}`} className="px-2 py-2">
                              <div
                                className={`w-full rounded-md border px-2 py-2 text-left transition ${
                                  selectedWeekDay === day
                                    ? "border-indigo-300 bg-indigo-500/20"
                                    : "border-[var(--border)] bg-black/20"
                                }`}
                              >
                                <p className="text-[10px] text-[var(--muted)]">Rutina del día</p>
                                {weeklyRoutineMetaByDay[day]?.routineName ? (
                                  <p className="text-[10px] text-indigo-100/80 truncate">{weeklyRoutineMetaByDay[day].routineName}</p>
                                ) : null}
                                <p className="text-[10px] text-[var(--muted)]">
                                  {weeklyRoutineMetaByDay[day]?.exerciseCount ?? (weeklyRoutineByDay[day] ?? []).length} ejercicios
                                </p>
                                <div className="mt-1 flex items-center gap-1">
                                  <button
                                    type="button"
                                    className="rounded-md border border-[var(--border)] bg-black/20 p-1 hover:bg-white/10"
                                    onClick={() => setSelectedWeekDay(day)}
                                    aria-label={`Ver rutina de ${day}`}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-md border border-[var(--border)] bg-black/20 p-1 hover:bg-white/10"
                                    onClick={() => openTrainingDayModal(day)}
                                    aria-label={`Editar rutina de ${day}`}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                  <p className="text-xs text-[var(--muted)]">Rutina de {selectedWeekDay}</p>
                  {selectedWeekRoutine?.exercises.length ? (
                    selectedWeekRoutine.exercises.map((exercise) => (
                      <p key={`week-routine-${exercise.id}`} className="mt-1 text-sm text-white">
                        {exercise.name} · {exercise.reps} reps
                      </p>
                    ))
                  ) : (
                    <p className="mt-1 text-sm text-[var(--muted)]">Sin ejercicios definidos.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-[var(--muted)]">Dieta por semana (ver o editar)</p>
                    <button
                      type="button"
                      className="rounded-md border border-[var(--border)] bg-black/20 px-2 py-1 text-xs text-white hover:bg-white/10"
                      onClick={() => openNutritionDayModal(selectedWeekDay)}
                    >
                      Editar {selectedWeekDay}
                    </button>
                  </div>
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-full text-left text-xs text-white">
                      <thead>
                        <tr>
                          {WEEK_DAYS.map((day) => (
                            <th key={`planning-nutrition-head-${day}`} className="px-2 py-1 font-medium text-[var(--muted)]">
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {WEEK_DAYS.map((day) => {
                            const dayMeals = weeklyNutritionByDay[day] ?? [];
                            const mealCount = dayMeals.length;
                            const foodCount = dayMeals.reduce((acc, meal) => acc + meal.foods.length, 0);
                            return (
                              <td key={`planning-nutrition-cell-${day}`} className="px-2 py-2 align-top">
                                <div
                                  className={`w-full min-w-[7rem] rounded-md border px-2 py-2 text-left transition ${
                                    selectedWeekDay === day
                                      ? "border-emerald-300/60 bg-emerald-500/15"
                                      : "border-[var(--border)] bg-black/20"
                                  }`}
                                >
                                  <p className="text-[10px] text-[var(--muted)]">Dieta del día</p>
                                  <p className="text-[10px] text-white">
                                    {mealCount} {mealCount === 1 ? "comida" : "comidas"}
                                  </p>
                                  <p className="text-[10px] text-[var(--muted)]">
                                    {foodCount} {foodCount === 1 ? "alimento" : "alimentos"}
                                  </p>
                                  <div className="mt-1 flex items-center gap-1">
                                    <button
                                      type="button"
                                      className="rounded-md border border-[var(--border)] bg-black/20 p-1 hover:bg-white/10"
                                      onClick={() => viewNutritionDay(day)}
                                      aria-label={`Ver dieta de ${day}`}
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      className="rounded-md border border-[var(--border)] bg-black/20 p-1 hover:bg-white/10"
                                      onClick={() => openNutritionDayModal(day)}
                                      aria-label={`Editar dieta de ${day}`}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                  <p className="text-xs text-[var(--muted)]">Dieta de {selectedWeekDay}</p>
                  {selectedWeekNutrition?.meals.length ? (
                    selectedWeekNutrition.meals.map((meal) => (
                      <p key={`week-nutrition-${selectedWeekDay}-${meal.id}`} className="mt-1 text-sm text-white">
                        {meal.label}: {meal.foods[0] ?? "Sin alimento"}
                      </p>
                    ))
                  ) : (
                    <p className="mt-1 text-sm text-[var(--muted)]">Sin comidas. Usa el lápiz en la tabla, Editar en la barra lateral o el detalle de abajo.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

