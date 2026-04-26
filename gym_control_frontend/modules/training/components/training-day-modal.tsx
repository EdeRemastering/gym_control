import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddRoutineExercise, useAssignRoutine, useCreateExercise, useCreateRoutine } from "@/hooks/use-zudel-mutations";
import { useExercises, useRoutineExercises, useRoutines } from "@/hooks/use-zudel-query";
import { useSessionStore } from "@/lib/session-store";
import { mapRoutineExerciseFromApi } from "@/modules/training/services/training-module.utils";
import { useTrainingStore } from "@/modules/training/store/use-training-store";
import type { RoutineExerciseDraft, WeeklyRoutineExercise } from "@/modules/training/types/training-module.types";
import { toast } from "sonner";

export function TrainingDayModal() {
  const [isAssignRoutineOpen, setIsAssignRoutineOpen] = useState(false);
  const [isCreateRoutineOpen, setIsCreateRoutineOpen] = useState(false);
  const [isDayExercisesOpen, setIsDayExercisesOpen] = useState(false);
  const [selectedRoutineToAssignId, setSelectedRoutineToAssignId] = useState("");
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newRoutineDescription, setNewRoutineDescription] = useState("");
  const [selectedCatalogExerciseId, setSelectedCatalogExerciseId] = useState("");
  const [selectedDayCatalogExerciseId, setSelectedDayCatalogExerciseId] = useState("");
  const [newDayExerciseName, setNewDayExerciseName] = useState("");
  const [newDayExerciseDescription, setNewDayExerciseDescription] = useState("");
  const [draftReps, setDraftReps] = useState("12");
  const [draftSets, setDraftSets] = useState("4");
  const [draftWeight, setDraftWeight] = useState("20");
  const [dayDraftReps, setDayDraftReps] = useState("12");
  const [dayDraftWeight, setDayDraftWeight] = useState("20");
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseDescription, setNewExerciseDescription] = useState("");
  const [draftExercises, setDraftExercises] = useState<
    Array<
      | {
          id: string;
          kind: "catalog";
          label: string;
          exerciseId: string;
          sets: number;
          reps: number;
          weight: number;
        }
      | {
          id: string;
          kind: "new";
          label: string;
          description: string;
          sets: number;
          reps: number;
          weight: number;
        }
    >
  >([]);
  const routines = useRoutines();
  const exercises = useExercises();
  const createRoutine = useCreateRoutine();
  const createExercise = useCreateExercise();
  const addRoutineExercise = useAddRoutineExercise();
  const assignRoutine = useAssignRoutine();
  const currentUser = useSessionStore((state) => state.user);
  const selectedRoutineExercisesQuery = useRoutineExercises(selectedRoutineToAssignId || undefined);
  const {
    trainingModalDay,
    weeklyRoutineByDay,
    setWeeklyRoutineMetaByDay,
    setRoutineExercisesByRoutineId,
    setTrainingModalDay,
    setWeeklyRoutineByDay,
  } = useTrainingStore((state) => ({
    trainingModalDay: state.trainingModalDay,
    weeklyRoutineByDay: state.weeklyRoutineByDay,
    setWeeklyRoutineMetaByDay: state.setWeeklyRoutineMetaByDay,
    setRoutineExercisesByRoutineId: state.setRoutineExercisesByRoutineId,
    setTrainingModalDay: state.setTrainingModalDay,
    setWeeklyRoutineByDay: state.setWeeklyRoutineByDay,
  }));

  const selectedRoutineMappedExercises = useMemo(
    () => (selectedRoutineExercisesQuery.data ?? []).map(mapRoutineExerciseFromApi),
    [selectedRoutineExercisesQuery.data],
  );

  function resetCreateRoutineDrafts() {
    setNewRoutineName("");
    setNewRoutineDescription("");
    setSelectedCatalogExerciseId("");
    setDraftSets("4");
    setDraftReps("12");
    setDraftWeight("20");
    setNewExerciseName("");
    setNewExerciseDescription("");
    setDraftExercises([]);
  }

  function onAssignSelectedRoutineToDay() {
    if (!trainingModalDay || !selectedRoutineToAssignId) {
      toast.error("Selecciona una rutina para asignar");
      return;
    }
    if (!selectedRoutineMappedExercises.length) {
      toast.error("La rutina seleccionada no tiene ejercicios");
      return;
    }

    const dayExercises: WeeklyRoutineExercise[] = selectedRoutineMappedExercises.map((item) => ({
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      reps: item.reps,
      weight: item.weight,
    }));

    setWeeklyRoutineByDay((prev) => ({
      ...prev,
      [trainingModalDay]: dayExercises,
    }));
    setRoutineExercisesByRoutineId((prev) => ({
      ...prev,
      [selectedRoutineToAssignId]: selectedRoutineMappedExercises,
    }));
    const selectedRoutine = (routines.data ?? []).find((routine) => routine.id === selectedRoutineToAssignId);
    setWeeklyRoutineMetaByDay((prev) => ({
      ...prev,
      [trainingModalDay]: {
        routineId: selectedRoutineToAssignId,
        routineName: selectedRoutine?.name ?? "Rutina",
        exerciseCount: dayExercises.length,
      },
    }));
    toast.success("Rutina asignada al día");
  }

  function onAddCatalogExerciseToDraft() {
    const selected = (exercises.data ?? []).find((item) => item.id === selectedCatalogExerciseId);
    if (!selected) {
      toast.error("Selecciona un ejercicio del catálogo");
      return;
    }
    const reps = Math.max(1, Number.parseInt(draftReps, 10) || 12);
    const sets = Math.max(1, Number.parseInt(draftSets, 10) || 4);
    const weight = Math.max(0, Number.parseInt(draftWeight, 10) || 20);
    setDraftExercises((prev) => [
      ...prev,
      {
        id: `catalog-${selected.id}-${Date.now()}`,
        kind: "catalog",
        label: selected.name,
        exerciseId: selected.id,
        sets,
        reps,
        weight,
      },
    ]);
    setSelectedCatalogExerciseId("");
  }

  function onAddNewExerciseToDraft() {
    const name = newExerciseName.trim();
    if (!name) {
      toast.error("Escribe el nombre del ejercicio nuevo");
      return;
    }
    const reps = Math.max(1, Number.parseInt(draftReps, 10) || 12);
    const sets = Math.max(1, Number.parseInt(draftSets, 10) || 4);
    const weight = Math.max(0, Number.parseInt(draftWeight, 10) || 20);
    setDraftExercises((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        kind: "new",
        label: name,
        description: newExerciseDescription.trim(),
        sets,
        reps,
        weight,
      },
    ]);
    setNewExerciseName("");
    setNewExerciseDescription("");
  }

  function onRemoveDraftExercise(itemId: string) {
    setDraftExercises((prev) => prev.filter((item) => item.id !== itemId));
  }

  async function onCreateRoutineAndAssign() {
    if (!trainingModalDay) return null;
    if (!newRoutineName.trim()) {
      toast.error("Escribe nombre para la rutina");
      return null;
    }
    if (!draftExercises.length) {
      toast.error("Agrega al menos un ejercicio");
      return null;
    }

    try {
      const createdRoutine = await createRoutine.mutateAsync({
        name: newRoutineName.trim(),
        description: newRoutineDescription.trim() || undefined,
      });

      const dayExercises: WeeklyRoutineExercise[] = [];
      const routineExercisesDraft: RoutineExerciseDraft[] = [];

      for (const draft of draftExercises) {
        const exerciseId =
          draft.kind === "catalog"
            ? draft.exerciseId
            : (
                await createExercise.mutateAsync({
                  name: draft.label,
                  description: draft.description || undefined,
                })
              ).id;

        await addRoutineExercise.mutateAsync({
          routineId: createdRoutine.id,
          exerciseId,
          sets: draft.sets,
          reps: draft.reps,
        });

        dayExercises.push({
          id: `${exerciseId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          exerciseCatalogId: exerciseId,
          name: draft.label,
          reps: draft.reps,
          weight: draft.weight,
        });

        routineExercisesDraft.push({
          id: `${exerciseId}-${Date.now()}`,
          exerciseCatalogId: exerciseId,
          name: draft.label,
          description: draft.kind === "new" ? draft.description : "",
          instructions: "",
          imageUrl: "",
          muscleGroup: "",
          objective: "Hipertrofia",
          difficulty: "Básico",
          rest: "60s",
          commonMistakes: "",
          executionTips: "",
          demoVideoUrl: "",
          reps: draft.reps,
          weight: draft.weight,
        });
      }

      setWeeklyRoutineByDay((prev) => ({
        ...prev,
        [trainingModalDay]: dayExercises,
      }));
      setRoutineExercisesByRoutineId((prev) => ({
        ...prev,
        [createdRoutine.id]: routineExercisesDraft,
      }));
      setWeeklyRoutineMetaByDay((prev) => ({
        ...prev,
        [trainingModalDay]: {
          routineId: createdRoutine.id,
          routineName: createdRoutine.name,
          exerciseCount: dayExercises.length,
        },
      }));
      setSelectedRoutineToAssignId(createdRoutine.id);
      resetCreateRoutineDrafts();
      toast.success("Rutina creada y asignada al día");
      return createdRoutine.id;
    } catch {
      toast.error("No se pudo crear y asignar la rutina");
      return null;
    }
  }

  function onRemoveExerciseFromDay(day: string, exerciseId: string) {
    setWeeklyRoutineByDay((prev) => ({
      ...prev,
      [day]: (prev[day] ?? []).filter((item) => item.id !== exerciseId),
    }));
    setWeeklyRoutineMetaByDay((prev) => {
      const current = prev[day];
      if (!current) return prev;
      return {
        ...prev,
        [day]: {
          ...current,
          exerciseCount: Math.max(0, (weeklyRoutineByDay[day] ?? []).length - 1),
        },
      };
    });
  }

  function onMoveExerciseInDay(day: string, exerciseId: string, direction: "up" | "down") {
    const source = weeklyRoutineByDay[day] ?? [];
    const index = source.findIndex((item) => item.id === exerciseId);
    if (index < 0) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= source.length) return;
    const next = [...source];
    [next[index], next[target]] = [next[target], next[index]];
    setWeeklyRoutineByDay((prev) => ({
      ...prev,
      [day]: next,
    }));
  }

  function onAddExerciseToDay(day: string) {
    const selected = (exercises.data ?? []).find((item) => item.id === selectedDayCatalogExerciseId);
    if (!selected) {
      toast.error("Selecciona un ejercicio del catálogo");
      return;
    }
    const reps = Math.max(1, Number.parseInt(dayDraftReps, 10) || 12);
    const weight = Math.max(0, Number.parseInt(dayDraftWeight, 10) || 20);
    const newExercise = {
      id: `${selected.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      exerciseCatalogId: selected.id,
      name: selected.name,
      reps,
      weight,
    };
    setWeeklyRoutineByDay((prev) => ({
      ...prev,
      [day]: [...(prev[day] ?? []), newExercise],
    }));
    setWeeklyRoutineMetaByDay((prev) => ({
      ...prev,
      [day]: {
        routineId: prev[day]?.routineId ?? selectedRoutineToAssignId ?? "",
        routineName: prev[day]?.routineName ?? "Rutina personalizada",
        exerciseCount: (weeklyRoutineByDay[day] ?? []).length + 1,
      },
    }));
    setSelectedDayCatalogExerciseId("");
    setDayDraftReps("12");
    setDayDraftWeight("20");
    toast.success("Ejercicio agregado al día");
  }

  async function onCreateExerciseAndAddToDay(day: string) {
    const name = newDayExerciseName.trim();
    if (!name) {
      toast.error("Escribe el nombre del ejercicio nuevo");
      return;
    }
    const reps = Math.max(1, Number.parseInt(dayDraftReps, 10) || 12);
    const weight = Math.max(0, Number.parseInt(dayDraftWeight, 10) || 20);
    try {
      const createdExercise = await createExercise.mutateAsync({
        name,
        description: newDayExerciseDescription.trim() || undefined,
      });
      const newExercise = {
        id: `${createdExercise.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        exerciseCatalogId: createdExercise.id,
        name: createdExercise.name,
        reps,
        weight,
      };
      setWeeklyRoutineByDay((prev) => ({
        ...prev,
        [day]: [...(prev[day] ?? []), newExercise],
      }));
      setWeeklyRoutineMetaByDay((prev) => ({
        ...prev,
        [day]: {
          routineId: prev[day]?.routineId ?? selectedRoutineToAssignId ?? "",
          routineName: prev[day]?.routineName ?? "Rutina personalizada",
          exerciseCount: (weeklyRoutineByDay[day] ?? []).length + 1,
        },
      }));
      setNewDayExerciseName("");
      setNewDayExerciseDescription("");
      setDayDraftReps("12");
      setDayDraftWeight("20");
      toast.success("Ejercicio creado y agregado al día");
    } catch {
      toast.error("No se pudo crear el ejercicio");
    }
  }

  async function persistAssignedRoutineToBackend(routineId: string) {
    if (!trainingModalDay || !currentUser?.id) return;
    const dayIndexMap: Record<string, number> = {
      Lunes: 1,
      Martes: 2,
      Miércoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sábado: 6,
      Domingo: 0,
    };
    const targetDayIndex = dayIndexMap[trainingModalDay] ?? 1;
    const now = new Date();
    const currentDay = now.getDay();
    const delta = (targetDayIndex - currentDay + 7) % 7;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + delta);
    startDate.setHours(8, 0, 0, 0);
    await assignRoutine.mutateAsync({
      userId: currentUser.id,
      routineId,
      assignedBy: currentUser.id,
      startDate: startDate.toISOString(),
    });
  }

  return (
    <Dialog
      open={Boolean(trainingModalDay)}
      onOpenChange={(open) => {
        if (!open) {
          setTrainingModalDay(null);
          setSelectedRoutineToAssignId("");
          resetCreateRoutineDrafts();
          setIsAssignRoutineOpen(false);
          setIsCreateRoutineOpen(false);
          setIsDayExercisesOpen(false);
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Entrenamiento de {trainingModalDay ?? ""}</DialogTitle>
          <DialogDescription>
            Gestiona este día desde acciones rápidas para mantener el modal compacto.
          </DialogDescription>
        </DialogHeader>
        {trainingModalDay ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
              <p className="text-xs text-[var(--muted)]">Rutina a asignar para este día</p>
              <div className="mt-2 space-y-1">
                <label className="text-xs text-[var(--muted)]">Rutina existente</label>
                <Select
                  value={selectedRoutineToAssignId || "__none__"}
                  onValueChange={(value) => setSelectedRoutineToAssignId(value === "__none__" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una rutina existente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Selecciona una rutina</SelectItem>
                    {(routines.data ?? []).map((routine) => (
                      <SelectItem key={`training-day-routine-${routine.id}`} value={routine.id}>
                        {routine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Ejercicios asignados al día: {(weeklyRoutineByDay[trainingModalDay] ?? []).length}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <Button variant="secondary" onClick={() => setIsAssignRoutineOpen(true)}>
                Asignar rutina
              </Button>
              <Button variant="secondary" onClick={() => setIsCreateRoutineOpen(true)}>
                Crear rutina
              </Button>
              <Button variant="secondary" onClick={() => setIsDayExercisesOpen(true)}>
                Ver ejercicios del día
              </Button>
            </div>

            <Dialog open={isAssignRoutineOpen} onOpenChange={setIsAssignRoutineOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Asignar rutina existente</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted)]">Rutina</label>
                    <Select
                      value={selectedRoutineToAssignId || "__none__"}
                      onValueChange={(value) => setSelectedRoutineToAssignId(value === "__none__" ? "" : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona rutina" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Selecciona rutina</SelectItem>
                        {(routines.data ?? []).map((routine) => (
                          <SelectItem key={`training-modal-routine-${routine.id}`} value={routine.id}>
                            {routine.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedRoutineToAssignId ? (
                    <p className="text-xs text-[var(--muted)]">
                      {selectedRoutineExercisesQuery.isFetching
                        ? "Cargando ejercicios de la rutina..."
                        : `${selectedRoutineMappedExercises.length} ejercicios listos para asignar`}
                    </p>
                  ) : null}
                  <Button
                    onClick={async () => {
                      onAssignSelectedRoutineToDay();
                      if (selectedRoutineToAssignId) {
                        try {
                          await persistAssignedRoutineToBackend(selectedRoutineToAssignId);
                        } catch {
                          toast.error("Se asignó localmente, pero no se pudo persistir en base de datos");
                        }
                      }
                      setIsAssignRoutineOpen(false);
                    }}
                    disabled={!selectedRoutineToAssignId || selectedRoutineExercisesQuery.isFetching}
                  >
                    Confirmar asignación
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateRoutineOpen} onOpenChange={setIsCreateRoutineOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Crear rutina nueva</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted)]">Nombre de la rutina</label>
                    <input
                      value={newRoutineName}
                      onChange={(event) => setNewRoutineName(event.target.value)}
                      placeholder="Ej: Torso fuerza"
                      className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted)]">Descripción de la rutina</label>
                    <input
                      value={newRoutineDescription}
                      onChange={(event) => setNewRoutineDescription(event.target.value)}
                      placeholder="Objetivo principal (opcional)"
                      className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                    />
                  </div>
                  <div className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
                    <p className="text-xs text-[var(--muted)]">Agregar ejercicio existente</p>
                    <div className="mt-2 space-y-1">
                      <label className="text-xs text-[var(--muted)]">Ejercicio del catálogo</label>
                      <Select
                        value={selectedCatalogExerciseId || "__none__"}
                        onValueChange={(value) => setSelectedCatalogExerciseId(value === "__none__" ? "" : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona ejercicio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Selecciona ejercicio</SelectItem>
                          {(exercises.data ?? []).map((exercise) => (
                            <SelectItem key={`training-modal-ex-${exercise.id}`} value={exercise.id}>
                              {exercise.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--muted)]">Sets</label>
                        <input
                          value={draftSets}
                          onChange={(event) => setDraftSets(event.target.value)}
                          placeholder="4"
                          className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--muted)]">Reps</label>
                        <input
                          value={draftReps}
                          onChange={(event) => setDraftReps(event.target.value)}
                          placeholder="12"
                          className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--muted)]">Peso (kg)</label>
                        <input
                          value={draftWeight}
                          onChange={(event) => setDraftWeight(event.target.value)}
                          placeholder="20"
                          className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                        />
                      </div>
                    </div>
                    <Button size="sm" className="mt-2" onClick={onAddCatalogExerciseToDraft}>
                      Agregar a borrador
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted)]">Nombre del ejercicio nuevo</label>
                    <input
                      value={newExerciseName}
                      onChange={(event) => setNewExerciseName(event.target.value)}
                      placeholder="Ej: Peso muerto rumano"
                      className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--muted)]">Descripción del ejercicio</label>
                    <input
                      value={newExerciseDescription}
                      onChange={(event) => setNewExerciseDescription(event.target.value)}
                      placeholder="Notas técnicas (opcional)"
                      className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                    />
                  </div>
                  <Button size="sm" onClick={onAddNewExerciseToDraft}>
                    Crear ejercicio y agregar
                  </Button>
                  <div className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
                    <p className="text-xs text-[var(--muted)]">Borrador ({draftExercises.length})</p>
                    {draftExercises.length ? (
                      <div className="mt-2 space-y-2">
                        {draftExercises.map((draft) => (
                          <div key={draft.id} className="flex items-center justify-between rounded-md border border-[var(--border)] bg-black/20 px-2 py-2">
                            <p className="text-sm text-white">
                              {draft.label} · {draft.sets}x{draft.reps} · {draft.weight}kg
                            </p>
                            <Button size="sm" variant="ghost" onClick={() => onRemoveDraftExercise(draft.id)}>
                              Quitar
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <Button
                    onClick={async () => {
                      const createdRoutineId = await onCreateRoutineAndAssign();
                      if (createdRoutineId) {
                        try {
                          await persistAssignedRoutineToBackend(createdRoutineId);
                        } catch {
                          toast.error("Se creó localmente, pero no se pudo persistir en base de datos");
                        }
                      }
                      setIsCreateRoutineOpen(false);
                    }}
                    loading={createRoutine.isPending || createExercise.isPending || addRoutineExercise.isPending}
                  >
                    Crear rutina y asignar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isDayExercisesOpen} onOpenChange={setIsDayExercisesOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Ejercicios del día</DialogTitle>
                </DialogHeader>
                <div className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
                  <p className="text-xs text-[var(--muted)]">Agregar ejercicio al día</p>
                  <div className="mt-2 space-y-2">
                    <Select
                      value={selectedDayCatalogExerciseId || "__none__"}
                      onValueChange={(value) => setSelectedDayCatalogExerciseId(value === "__none__" ? "" : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona ejercicio del catálogo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Selecciona ejercicio</SelectItem>
                        {(exercises.data ?? []).map((exercise) => (
                          <SelectItem key={`training-day-add-${exercise.id}`} value={exercise.id}>
                            {exercise.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--muted)]">Reps</label>
                        <input
                          value={dayDraftReps}
                          onChange={(event) => setDayDraftReps(event.target.value)}
                          className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-[var(--muted)]">Peso (kg)</label>
                        <input
                          value={dayDraftWeight}
                          onChange={(event) => setDayDraftWeight(event.target.value)}
                          className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                        />
                      </div>
                    </div>
                    <Button type="button" onClick={() => onAddExerciseToDay(trainingModalDay)}>
                      <Plus className="mr-1 h-4 w-4" />
                      Agregar ejercicio
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
                  <p className="text-xs text-[var(--muted)]">Crear ejercicio nuevo y agregar al día</p>
                  <div className="mt-2 space-y-2">
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--muted)]">Nombre del ejercicio</label>
                      <input
                        value={newDayExerciseName}
                        onChange={(event) => setNewDayExerciseName(event.target.value)}
                        placeholder="Ej: Sentadilla búlgara"
                        className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--muted)]">Descripción (opcional)</label>
                      <input
                        value={newDayExerciseDescription}
                        onChange={(event) => setNewDayExerciseDescription(event.target.value)}
                        placeholder="Notas técnicas"
                        className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => void onCreateExerciseAndAddToDay(trainingModalDay)}
                      loading={createExercise.isPending}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Crear ejercicio y agregar
                    </Button>
                  </div>
                </div>
                {(weeklyRoutineByDay[trainingModalDay] ?? []).length ? (
                  <div className="space-y-2">
                    {(weeklyRoutineByDay[trainingModalDay] ?? []).map((exercise, index, array) => (
                      <div
                        key={`training-modal-day-${exercise.id}`}
                        className="flex items-center justify-between rounded-md border border-[var(--border)] bg-black/20 px-2 py-2"
                      >
                        <p className="text-sm text-white">
                          {exercise.name} · {exercise.reps} reps · {exercise.weight} kg
                        </p>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={index === 0}
                            onClick={() => onMoveExerciseInDay(trainingModalDay, exercise.id, "up")}
                            aria-label="Subir ejercicio"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={index === array.length - 1}
                            onClick={() => onMoveExerciseInDay(trainingModalDay, exercise.id, "down")}
                            aria-label="Bajar ejercicio"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => onRemoveExerciseFromDay(trainingModalDay, exercise.id)}>
                            Quitar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted)]">Aún no hay ejercicios para este día.</p>
                )}
              </DialogContent>
            </Dialog>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
