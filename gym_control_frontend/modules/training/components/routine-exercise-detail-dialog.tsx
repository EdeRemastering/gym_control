import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTrainingStore } from "@/modules/training/store/use-training-store";

export function RoutineExerciseDetailDialog() {
  const {
    selectedRoutineId,
    selectedRoutineExerciseDetailId,
    routineExercisesByRoutineId,
    setSelectedRoutineExerciseDetailId,
  } = useTrainingStore((state) => ({
    selectedRoutineId: state.selectedRoutineId,
    selectedRoutineExerciseDetailId: state.selectedRoutineExerciseDetailId,
    routineExercisesByRoutineId: state.routineExercisesByRoutineId,
    setSelectedRoutineExerciseDetailId: state.setSelectedRoutineExerciseDetailId,
  }));

  const selectedRoutineExerciseDetail =
    (selectedRoutineId ? routineExercisesByRoutineId[selectedRoutineId] ?? [] : []).find(
      (item) => item.id === selectedRoutineExerciseDetailId,
    ) ?? null;

  return (
    <Dialog
      open={Boolean(selectedRoutineExerciseDetail)}
      onOpenChange={(open) => {
        if (!open) setSelectedRoutineExerciseDetailId(null);
      }}
    >
      <DialogContent className="max-w-3xl">
        {selectedRoutineExerciseDetail ? (
          <>
            <DialogHeader>
              <DialogTitle>{selectedRoutineExerciseDetail.name}</DialogTitle>
              <DialogDescription>
                {selectedRoutineExerciseDetail.muscleGroup || "Grupo muscular"} · {selectedRoutineExerciseDetail.objective} ·
                Nivel {selectedRoutineExerciseDetail.difficulty}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                  {selectedRoutineExerciseDetail.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedRoutineExerciseDetail.imageUrl}
                      alt={`Guía visual ${selectedRoutineExerciseDetail.name}`}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-white/5 text-sm text-[var(--muted)]">
                      Sin media disponible
                    </div>
                  )}
                </div>
                {selectedRoutineExerciseDetail.demoVideoUrl ? (
                  <a
                    href={selectedRoutineExerciseDetail.demoVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-lg border border-indigo-300/40 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-100 transition hover:bg-indigo-500/20"
                  >
                    Ver video demostrativo
                  </a>
                ) : null}
                <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Cómo realizarlo</p>
                  <p className="mt-1 text-sm text-white">{selectedRoutineExerciseDetail.instructions || "Sin indicaciones"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Parámetros</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-white">
                    <p>Series: 4</p>
                    <p>Reps: {selectedRoutineExerciseDetail.reps}</p>
                    <p>Peso: {selectedRoutineExerciseDetail.weight} kg</p>
                    <p>Descanso: {selectedRoutineExerciseDetail.rest}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Errores comunes</p>
                  <p className="mt-1 text-sm text-white">
                    {selectedRoutineExerciseDetail.commonMistakes || "Sin errores registrados"}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Tips de ejecución</p>
                  <p className="mt-1 text-sm text-white">
                    {selectedRoutineExerciseDetail.executionTips || "Sin tips registrados"}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
