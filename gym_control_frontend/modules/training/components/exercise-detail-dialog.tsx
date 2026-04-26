import { AlertTriangle, Lightbulb, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTrainingStore } from "@/modules/training/store/use-training-store";
import { getExerciseContext } from "@/modules/training/services/training-module.utils";
import type { SessionExercise } from "@/modules/training/types/training-module.types";
import { toast } from "sonner";

export function ExerciseDetailDialog() {
  const {
    selectedRoutineId,
    routineExercisesByRoutineId,
    selectedExerciseId,
    setSelectedExerciseId,
    setActiveExerciseIndex,
    completedSetsByExerciseId,
    setCompletedSetsByExerciseId,
  } = useTrainingStore((state) => ({
    selectedRoutineId: state.selectedRoutineId,
    routineExercisesByRoutineId: state.routineExercisesByRoutineId,
    selectedExerciseId: state.selectedExerciseId,
    setSelectedExerciseId: state.setSelectedExerciseId,
    setActiveExerciseIndex: state.setActiveExerciseIndex,
    completedSetsByExerciseId: state.completedSetsByExerciseId,
    setCompletedSetsByExerciseId: state.setCompletedSetsByExerciseId,
  }));

  const sessionExercises: SessionExercise[] = (selectedRoutineId ? routineExercisesByRoutineId[selectedRoutineId] ?? [] : []).map(
    (item) => ({
      id: item.id,
      exercise: item.name,
      reps: item.reps,
      weight: item.weight,
    }),
  );
  const selectedExercise = sessionExercises.find((exercise) => exercise.id === selectedExerciseId) ?? null;
  const selectedExerciseIndex = selectedExercise ? sessionExercises.findIndex((item) => item.id === selectedExercise.id) : -1;
  const selectedExerciseContext =
    selectedExercise && selectedExerciseIndex >= 0
      ? getExerciseContext(selectedExercise.exercise, selectedExercise.reps, selectedExercise.weight, selectedExerciseIndex)
      : null;

  return (
    <Dialog
      open={Boolean(selectedExercise)}
      onOpenChange={(open) => {
        if (!open) setSelectedExerciseId(null);
      }}
    >
      <DialogContent className="max-w-3xl">
        {selectedExercise && selectedExerciseContext ? (
          <>
            <DialogHeader>
              <DialogTitle>{selectedExercise.exercise}</DialogTitle>
              <DialogDescription>
                {selectedExerciseContext.muscleGroup} · {selectedExerciseContext.objective} · Nivel{" "}
                {selectedExerciseContext.difficulty}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                  {selectedExerciseContext.mediaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedExerciseContext.mediaUrl}
                      alt={`Guía visual ${selectedExercise.exercise}`}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-white/5 text-sm text-[var(--muted)]">
                      Sin media disponible
                    </div>
                  )}
                </div>
                {selectedExerciseContext.demoVideoUrl ? (
                  <a
                    href={selectedExerciseContext.demoVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-lg border border-indigo-300/40 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-100 transition hover:bg-indigo-500/20"
                  >
                    Ver video demostrativo
                  </a>
                ) : null}
                <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Cómo realizarlo</p>
                  <p className="mt-1 text-sm text-white">{selectedExerciseContext.howTo}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Contexto del ejercicio</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-white">
                    <p className="inline-flex items-center gap-1">
                      <Target className="h-4 w-4 text-indigo-200" />
                      {selectedExerciseContext.objective}
                    </p>
                    <p>{selectedExerciseContext.muscleGroup}</p>
                    <p>Nivel: {selectedExerciseContext.difficulty}</p>
                    <p>Objetivo set: técnica + control</p>
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Parámetros</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-white">
                    <p>Series: {selectedExerciseContext.params.sets}</p>
                    <p>Reps: {selectedExerciseContext.params.reps}</p>
                    <p>Peso: {selectedExerciseContext.params.suggestedWeight ?? "Bodyweight"}</p>
                    <p>Descanso: {selectedExerciseContext.params.rest}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                  <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
                    Errores comunes
                  </p>
                  <ul className="mt-1 space-y-1 text-sm text-white">
                    {selectedExerciseContext.mistakes.map((mistake) => (
                      <li key={mistake}>- {mistake}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                  <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                    <Lightbulb className="h-3.5 w-3.5 text-emerald-300" />
                    Tips de ejecución
                  </p>
                  <ul className="mt-1 space-y-1 text-sm text-white">
                    {selectedExerciseContext.tips.map((tip) => (
                      <li key={tip}>- {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  const index = sessionExercises.findIndex((item) => item.id === selectedExercise.id);
                  setActiveExerciseIndex(Math.max(0, index));
                  toast.success("Ejercicio enfocado en sesión activa");
                }}
              >
                Iniciar ejercicio
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const target = selectedExerciseContext.params.sets;
                  const doneHere = completedSetsByExerciseId[selectedExercise.id] ?? 0;
                  if (doneHere >= target) return;
                  setCompletedSetsByExerciseId((prev) => ({ ...prev, [selectedExercise.id]: doneHere + 1 }));
                  toast.success(`Set ${doneHere + 1} de ${target} registrado`);
                }}
              >
                Registrar set
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  setCompletedSetsByExerciseId((prev) => ({
                    ...prev,
                    [selectedExercise.id]: selectedExerciseContext.params.sets,
                  }))
                }
              >
                Completar
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  const currentIndex = sessionExercises.findIndex((item) => item.id === selectedExercise.id);
                  const nextIndex = currentIndex === sessionExercises.length - 1 ? 0 : currentIndex + 1;
                  setSelectedExerciseId(sessionExercises[nextIndex]?.id ?? null);
                  setActiveExerciseIndex(Math.max(0, nextIndex));
                }}
              >
                Siguiente ejercicio
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
