import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddRoutineExercise } from "@/hooks/use-zudel-mutations";
import { useExercises, useNutritionMeals, useNutritionPlans, useRoutines } from "@/hooks/use-zudel-query";
import { useRoutineBuilderStore } from "@/modules/training/store/use-routine-builder-store";
import { useTrainingStore } from "@/modules/training/store/use-training-store";
import type { RoutineExerciseDraft } from "@/modules/training/types/training-module.types";
import { toast } from "sonner";

export function TrainingSetupCard() {
  const [isSelectedRoutineModalOpen, setIsSelectedRoutineModalOpen] = useState(false);
  const [isAddRoutineExerciseOpen, setIsAddRoutineExerciseOpen] = useState(false);
  const [catalogExerciseIdToAdd, setCatalogExerciseIdToAdd] = useState("");
  const [exerciseRepsToAdd, setExerciseRepsToAdd] = useState("12");
  const [exerciseSetsToAdd, setExerciseSetsToAdd] = useState("4");
  const [exerciseWeightToAdd, setExerciseWeightToAdd] = useState("20");
  const routines = useRoutines();
  const exercises = useExercises();
  const addRoutineExercise = useAddRoutineExercise();
  const {
    trainingFocus,
    selectedRoutineId,
    setSelectedRoutineId,
    editingRoutineExerciseId,
    routineExercisesByRoutineId,
    setRoutineExercisesByRoutineId,
    setSelectedRoutineExerciseDetailId,
    setEditingRoutineExerciseId,
  } = useRoutineBuilderStore((state) => ({
    trainingFocus: state.trainingFocus,
    selectedRoutineId: state.selectedRoutineId,
    setSelectedRoutineId: state.setSelectedRoutineId,
    editingRoutineExerciseId: state.editingRoutineExerciseId,
    routineExercisesByRoutineId: state.routineExercisesByRoutineId,
    setRoutineExercisesByRoutineId: state.setRoutineExercisesByRoutineId,
    setSelectedRoutineExerciseDetailId: state.setSelectedRoutineExerciseDetailId,
    setEditingRoutineExerciseId: state.setEditingRoutineExerciseId,
  }));

  const {
    selectedWeekDay,
    weeklyNutritionByDay,
    selectedNutritionPlanId,
    setSelectedNutritionPlanId,
    setTrainingModalDay,
    setNutritionModalDay,
    setNutritionModalSelectedMealId,
  } = useTrainingStore((state) => ({
    selectedWeekDay: state.selectedWeekDay,
    weeklyNutritionByDay: state.weeklyNutritionByDay,
    selectedNutritionPlanId: state.selectedNutritionPlanId,
    setSelectedNutritionPlanId: state.setSelectedNutritionPlanId,
    setTrainingModalDay: state.setTrainingModalDay,
    setNutritionModalDay: state.setNutritionModalDay,
    setNutritionModalSelectedMealId: state.setNutritionModalSelectedMealId,
  }));

  const nutritionPlans = useNutritionPlans();
  const activeNutritionPlanId = useMemo(() => {
    const list = nutritionPlans.data ?? [];
    const first = list[0]?.id;
    if (selectedNutritionPlanId && list.some((p) => p.id === selectedNutritionPlanId)) {
      return selectedNutritionPlanId;
    }
    return first;
  }, [nutritionPlans.data, selectedNutritionPlanId]);
  const planMealsQuery = useNutritionMeals(activeNutritionPlanId);
  const [isPlanMealsModalOpen, setIsPlanMealsModalOpen] = useState(false);

  const hasRoutines = (routines.data ?? []).length > 0;
  const hasNutritionPlans = (nutritionPlans.data ?? []).length > 0;
  const selectedRoutineExercises: RoutineExerciseDraft[] = selectedRoutineId
    ? (routineExercisesByRoutineId[selectedRoutineId] ?? [])
    : [];

  function onRemoveRoutineExercise(exerciseId: string) {
    if (!selectedRoutineId) return;
    setRoutineExercisesByRoutineId((prev) => ({
      ...prev,
      [selectedRoutineId]: (prev[selectedRoutineId] ?? []).filter((item) => item.id !== exerciseId),
    }));
    if (editingRoutineExerciseId === exerciseId) {
      setEditingRoutineExerciseId(null);
    }
    toast.success("Ejercicio quitado de la rutina");
  }

  function onMoveRoutineExercise(exerciseId: string, direction: "up" | "down") {
    if (!selectedRoutineId) return;
    const source = routineExercisesByRoutineId[selectedRoutineId] ?? [];
    const index = source.findIndex((item) => item.id === exerciseId);
    if (index < 0) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= source.length) return;
    const next = [...source];
    [next[index], next[target]] = [next[target], next[index]];
    setRoutineExercisesByRoutineId((prev) => ({
      ...prev,
      [selectedRoutineId]: next,
    }));
  }

  async function onAddExerciseToRoutine() {
    if (!selectedRoutineId) {
      toast.error("Selecciona una rutina");
      return;
    }
    const selectedExercise = (exercises.data ?? []).find((item) => item.id === catalogExerciseIdToAdd);
    if (!selectedExercise) {
      toast.error("Selecciona un ejercicio del catálogo");
      return;
    }
    const reps = Math.max(1, Number.parseInt(exerciseRepsToAdd, 10) || 12);
    const sets = Math.max(1, Number.parseInt(exerciseSetsToAdd, 10) || 4);
    const weight = Math.max(0, Number.parseInt(exerciseWeightToAdd, 10) || 20);
    try {
      await addRoutineExercise.mutateAsync({
        routineId: selectedRoutineId,
        exerciseId: selectedExercise.id,
        sets,
        reps,
      });
      const draft: RoutineExerciseDraft = {
        id: `${selectedExercise.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        exerciseCatalogId: selectedExercise.id,
        name: selectedExercise.name,
        description: selectedExercise.description ?? "",
        instructions: "",
        imageUrl: "",
        muscleGroup: "",
        objective: "Hipertrofia",
        difficulty: "Básico",
        rest: "60s",
        commonMistakes: "",
        executionTips: "",
        demoVideoUrl: "",
        reps,
        weight,
      };
      setRoutineExercisesByRoutineId((prev) => ({
        ...prev,
        [selectedRoutineId]: [...(prev[selectedRoutineId] ?? []), draft],
      }));
      setCatalogExerciseIdToAdd("");
      setExerciseRepsToAdd("12");
      setExerciseSetsToAdd("4");
      setExerciseWeightToAdd("20");
      setIsAddRoutineExerciseOpen(false);
      toast.success("Ejercicio agregado a la rutina");
    } catch {
      toast.error("No se pudo agregar el ejercicio");
    }
  }

  return (
    <Card className="lg:col-span-3">
      {trainingFocus === "nutrition" ? (
        <>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Orden recomendado · nutrición</p>
          <div className="mt-3 grid gap-3 lg:grid-cols-1">
            <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
              <p className="text-xs text-[var(--muted)]">Paso 1</p>
              <p className="text-sm font-semibold text-white">Seleccionar dieta y revisar alimentos del plan</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Igual que con la rutina de entrenamiento: primero eliges la <strong className="text-white/80">dieta</strong> (plan
                nutricional). Luego, en <strong className="text-white/80">Hoy / Semana</strong>, ojo = ver día, lápiz = editar
                comidas de la semana.
              </p>
              <label className="mt-2 block text-xs text-[var(--muted)]">Dieta</label>
              <div className="mt-1 flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setNutritionModalDay(selectedWeekDay);
                    const firstId = (weeklyNutritionByDay[selectedWeekDay] ?? [])[0]?.id ?? null;
                    setNutritionModalSelectedMealId(firstId);
                  }}
                >
                  Crear plan del día
                </Button>
                <div className="flex-1">
                  <Select
                    value={selectedNutritionPlanId || "__none__"}
                    onValueChange={(value) => setSelectedNutritionPlanId(value === "__none__" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona dieta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Selecciona dieta</SelectItem>
                      {(nutritionPlans.data ?? []).map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {!hasNutritionPlans ? (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Aún no hay dietas asignadas. Cuando el gimnasio te asigne un plan, aparecerá en esta lista.
                </p>
              ) : null}
              {hasNutritionPlans && !selectedNutritionPlanId ? (
                <p className="mt-2 text-xs text-[var(--muted)]">Tienes dietas disponibles. Selecciona una para ver el detalle y el
                  catálogo de alimentos del plan.</p>
              ) : null}

              {selectedNutritionPlanId ? (
                <div className="mt-4 rounded-xl border border-[var(--border)] bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Dieta seleccionada</p>
                      <p className="text-sm text-white">
                        {(planMealsQuery.data ?? []).length} alimentos en el plan (API)
                      </p>
                    </div>
                    <Button type="button" size="sm" variant="secondary" onClick={() => setIsPlanMealsModalOpen(true)}>
                      Ver alimentos
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <Dialog open={isPlanMealsModalOpen} onOpenChange={setIsPlanMealsModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Alimentos del plan seleccionado</DialogTitle>
              </DialogHeader>
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {planMealsQuery.isLoading ? (
                  <p className="text-sm text-[var(--muted)]">Cargando…</p>
                ) : (planMealsQuery.data ?? []).length ? (
                  (planMealsQuery.data ?? []).map((meal) => (
                    <div key={meal.id} className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
                      <p className="text-sm font-medium text-white">{meal.description || "Entrada de plan"}</p>
                      <p className="text-xs text-[var(--muted)]">
                        Tipo: {meal.mealType} · Día: {meal.dayOfWeek}
                        {meal.calories != null ? ` · ${meal.calories} kcal` : ""}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--muted)]">Este plan aún no tiene alimentos registrados en el sistema.</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Orden recomendado · entrenamiento</p>
          <div className="mt-3 grid gap-3 lg:grid-cols-1">
            <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
              <p className="text-xs text-[var(--muted)]">Paso 1</p>
              <p className="text-sm font-semibold text-white">Seleccionar rutina y revisar ejercicios</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Si no existe la rutina, créala desde Plan semanal al abrir un día.
              </p>
              <label className="mt-2 block text-xs text-[var(--muted)]">Rutina</label>
              <div className="mt-1 flex items-center gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => setTrainingModalDay(selectedWeekDay)}>
                  Crear rutina
                </Button>
                <div className="flex-1">
                  <Select
                    value={selectedRoutineId || "__none__"}
                    onValueChange={(value) => {
                      setSelectedRoutineId(value === "__none__" ? "" : value);
                      setEditingRoutineExerciseId(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona rutina" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Selecciona rutina</SelectItem>
                      {(routines.data ?? []).map((routine) => (
                        <SelectItem key={routine.id} value={routine.id}>
                          {routine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {!hasRoutines ? (
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Aún no hay rutinas. Abre Plan semanal y crea una desde el día que desees.
                </p>
              ) : null}
              {hasRoutines && !selectedRoutineId ? (
                <p className="mt-2 text-xs text-[var(--muted)]">Ya tienes rutinas creadas. Selecciona una para empezar la sesión en vivo.</p>
              ) : null}

              {selectedRoutineId ? (
                <div className="mt-4 rounded-xl border border-[var(--border)] bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Rutina seleccionada</p>
                      <p className="text-sm text-white">{selectedRoutineExercises.length} ejercicios</p>
                    </div>
                    <Button type="button" size="sm" variant="secondary" onClick={() => setIsSelectedRoutineModalOpen(true)}>
                      Ver ejercicios
                    </Button>
                  </div>
                </div>
              ) : null}

              <Dialog open={isSelectedRoutineModalOpen} onOpenChange={setIsSelectedRoutineModalOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Ejercicios de la rutina seleccionada</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2">
                    <div className="flex items-center justify-end">
                      <Button size="sm" onClick={() => setIsAddRoutineExerciseOpen(true)}>
                        <Plus className="mr-1 h-4 w-4" />
                        Agregar ejercicio
                      </Button>
                    </div>
                    {selectedRoutineExercises.length ? (
                      selectedRoutineExercises.map((item, index) => (
                        <div key={item.id} className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
                          <p className="text-sm font-semibold text-white">{item.name}</p>
                          <p className="text-xs text-[var(--muted)]">
                            {item.reps} reps · {item.weight} kg
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={index === 0}
                              onClick={() => onMoveRoutineExercise(item.id, "up")}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={index === selectedRoutineExercises.length - 1}
                              onClick={() => onMoveRoutineExercise(item.id, "down")}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setSelectedRoutineExerciseDetailId(item.id)}>
                              Ver detalle
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => onRemoveRoutineExercise(item.id)}>
                              Quitar
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-lg border border-dashed border-[var(--border)] bg-white/5 p-3 text-xs text-[var(--muted)]">
                        Esta rutina no tiene ejercicios aún. Añade el primero para preparar la sesión.
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddRoutineExerciseOpen} onOpenChange={setIsAddRoutineExerciseOpen}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Agregar ejercicio a la rutina</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--muted)]">Ejercicio del catálogo</label>
                      <Select
                        value={catalogExerciseIdToAdd || "__none__"}
                        onValueChange={(value) => setCatalogExerciseIdToAdd(value === "__none__" ? "" : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona ejercicio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Selecciona ejercicio</SelectItem>
                          {(exercises.data ?? []).map((exercise) => (
                            <SelectItem key={exercise.id} value={exercise.id}>
                              {exercise.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--muted)]">Sets</label>
                        <input
                          value={exerciseSetsToAdd}
                          onChange={(event) => setExerciseSetsToAdd(event.target.value)}
                          className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--muted)]">Reps</label>
                        <input
                          value={exerciseRepsToAdd}
                          onChange={(event) => setExerciseRepsToAdd(event.target.value)}
                          className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--muted)]">Peso</label>
                        <input
                          value={exerciseWeightToAdd}
                          onChange={(event) => setExerciseWeightToAdd(event.target.value)}
                          className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                        />
                      </div>
                    </div>
                    <Button onClick={onAddExerciseToRoutine} loading={addRoutineExercise.isPending}>
                      Agregar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

