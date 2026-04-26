"use client";

import { useState } from "react";
import { Bookmark, ChevronLeft, ChevronRight, Info, Pause, Play, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExerciseTechniqueModal } from "@/modules/training/components/exercise-technique-modal";
import { SetsTrackingTable } from "@/modules/training/components/sets-tracking-table";
import { usePersistWorkoutSet } from "@/modules/training/hooks/use-training-optimistic";
import { useLiveWorkoutDerived } from "@/modules/training/hooks/use-live-workout-derived";
import { parseRepsWeightForSetLog, parseRestToSeconds } from "@/modules/training/services/training-module.utils";
import { useTrainingModuleStore } from "@/modules/training/stores/use-training-module-store";
import { useTrainingStore } from "@/modules/training/store/use-training-store";
import { toast } from "sonner";

function effortFromDifficulty(d: string): string {
  if (d === "Avanzado") return "9/10";
  if (d === "Intermedio") return "8/10";
  return "6/10";
}

export function LiveWorkoutFocusCard() {
  const [isTechniqueModalOpen, setIsTechniqueModalOpen] = useState(false);
  const { sessionExercises, activeExerciseIndex, focusExercise, focusExerciseContext, nextExerciseInSession } =
    useLiveWorkoutDerived();
  const persistSet = usePersistWorkoutSet();
  const {
    completedSetsByExerciseId,
    setCompletedSetsByExerciseId,
    setActiveExerciseIndex,
    setSelectedExerciseId,
    setRestInitialTotal,
    setRestSeconds,
    setIsRestPaused,
    setIsRestRunning,
  } = useTrainingStore(
    useShallow((state) => ({
      completedSetsByExerciseId: state.completedSetsByExerciseId,
      setCompletedSetsByExerciseId: state.setCompletedSetsByExerciseId,
      setActiveExerciseIndex: state.setActiveExerciseIndex,
      setSelectedExerciseId: state.setSelectedExerciseId,
      setRestInitialTotal: state.setRestInitialTotal,
      setRestSeconds: state.setRestSeconds,
      setIsRestPaused: state.setIsRestPaused,
      setIsRestRunning: state.setIsRestRunning,
    })),
  );

  if (!focusExercise || !focusExerciseContext) {
    return (
      <Card className="overflow-hidden border-violet-500/20 bg-[#0c101c]/90 p-4 shadow-inner backdrop-blur-sm">
        <p className="text-sm text-[var(--muted)]">No hay ejercicios en esta rutina.</p>
      </Card>
    );
  }

  const targetSets = focusExerciseContext.params.sets;
  const doneHere = completedSetsByExerciseId[focusExercise.id] ?? 0;
  const canGoNext = doneHere >= targetSets;
  const moveExercise = (direction: "prev" | "next") => {
    if (!sessionExercises.length) return;
    const next =
      direction === "prev"
        ? activeExerciseIndex === 0
          ? sessionExercises.length - 1
          : activeExerciseIndex - 1
        : activeExerciseIndex === sessionExercises.length - 1
          ? 0
          : activeExerciseIndex + 1;
    setActiveExerciseIndex(next);
    setSelectedExerciseId(sessionExercises[next]?.id ?? null);
  };

  const confirmCurrentSetAndRest = () => {
    const target = focusExerciseContext.params.sets;
    const doneCurrent = completedSetsByExerciseId[focusExercise.id] ?? 0;
    if (doneCurrent >= target) {
      toast.info("Ya completaste todas las series de este ejercicio");
      return;
    }
    const rest = parseRestToSeconds(focusExerciseContext.params.rest);
    const row =
      useTrainingModuleStore.getState().setRowDrafts[doneCurrent] ?? {
        reps: String(focusExercise.reps),
        weight: String(focusExercise.weight),
      };
    const { reps: repsNum, weight: weightNum } = parseRepsWeightForSetLog(row, {
      reps: focusExercise.reps,
      weight: focusExercise.weight,
    });
    if (focusExercise.exerciseCatalogId) {
      void persistSet
        .mutateAsync({
          catalogExerciseId: focusExercise.exerciseCatalogId,
          reps: repsNum,
          weight: weightNum,
          restTimeSec: rest,
        })
        .catch(() => {
          // toast en usePersistWorkoutSet.onError
        });
    }
    setCompletedSetsByExerciseId((prev) => ({
      ...prev,
      [focusExercise.id]: doneCurrent + 1,
    }));
    setRestInitialTotal(rest);
    setRestSeconds(rest);
    setIsRestPaused(false);
    setIsRestRunning(true);
    toast.success(`Set ${doneCurrent + 1} de ${target} registrado`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card className="relative overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.08] to-[#0B0E14] p-4 shadow-[0_8px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-4">
        <div
          className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-1/4 -translate-y-1/3 rounded-full bg-[#7c3aed]/20 blur-3xl"
          aria-hidden
        />
        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 -translate-x-1/3 rounded-full bg-[#2dd4bf]/10 blur-3xl" aria-hidden />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/50 lg:aspect-auto lg:min-h-[210px] lg:w-[44%]">
            {focusExerciseContext.mediaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={focusExerciseContext.mediaUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-[180px] w-full items-center justify-center text-[var(--muted)]">
                <Target className="h-12 w-12 opacity-40" />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <button
              type="button"
              onClick={() => setIsTechniqueModalOpen(true)}
              className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-sm transition hover:bg-white/20"
              aria-label="Ver técnica y consejos"
            >
              <Play className="h-6 w-6 pl-0.5" fill="currentColor" />
            </button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 h-9 w-9 border border-white/10 bg-black/30 text-zinc-200 hover:bg-white/10"
              onClick={() => toast.info("Guardado en favoritos (demo)")}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold tracking-tight text-white md:text-2xl">{focusExercise.exercise}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-500/35 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-100">
                {focusExerciseContext.muscleGroup.split(/[\s,]/)[0] || "Grupo"}
              </span>
              <span className="rounded-full border border-violet-400/40 bg-violet-500/15 px-2.5 py-0.5 text-[11px] font-medium text-violet-100">
                {focusExerciseContext.objective}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-zinc-300">
                {focusExerciseContext.difficulty}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                className="gap-2 border-violet-500/35 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20"
                onClick={() => setIsTechniqueModalOpen(true)}
              >
                <Info className="h-4 w-4" />
                Ver técnica y consejos
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="gap-1.5 text-zinc-400 hover:text-white"
                onClick={() => toast.info("Guardado en favoritos (demo)")}
              >
                <Bookmark className="h-4 w-4" />
                Guardar
              </Button>
            </div>
          </div>
        </div>

        <ExerciseTechniqueModal
          open={isTechniqueModalOpen}
          onOpenChange={setIsTechniqueModalOpen}
          exerciseName={focusExercise.exercise}
          context={focusExerciseContext}
        />

        <div className="relative mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          {(
            [
              { label: "Series", value: String(focusExerciseContext.params.sets) },
              { label: "Repeticiones", value: focusExerciseContext.params.reps },
              { label: "Descanso", value: focusExerciseContext.params.rest },
              { label: "Esfuerzo", value: effortFromDifficulty(focusExerciseContext.difficulty) },
            ] as const
          ).map((cell) => (
            <div
              key={cell.label}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-2 py-2 shadow-inner"
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{cell.label}</p>
              <p className="mt-0.5 text-base font-bold text-white md:text-lg">{cell.value}</p>
            </div>
          ))}
        </div>

        <SetsTrackingTable
          exerciseId={focusExercise.id}
          targetSets={targetSets}
          doneHere={doneHere}
          defaultReps={focusExercise.reps}
          defaultWeight={focusExercise.weight}
        />

        <div className="relative mt-3 rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent px-3 py-2 text-center text-[11px] text-zinc-400">
          {nextExerciseInSession ? (
            <>
              <span className="font-semibold uppercase tracking-wide text-zinc-500">A continuación: </span>
              <span className="text-zinc-100">{nextExerciseInSession.exercise}</span>
            </>
          ) : (
            <span>Último ejercicio de la sesión</span>
          )}
        </div>

        <div className="relative mt-4 hidden items-stretch gap-2 md:flex">
          <Button
            type="button"
            variant="secondary"
            className="h-12 w-12 shrink-0 rounded-2xl border border-white/10 bg-[#151a28] px-0 hover:bg-[#1c2233]"
            onClick={() => moveExercise("prev")}
            aria-label="Ejercicio anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="primary"
            className="h-12 min-w-0 flex-1 gap-2 rounded-2xl border-0 bg-[#7c3aed] text-sm font-bold shadow-[0_12px_40px_rgba(124,58,237,0.45)] hover:bg-[#6d28d9]"
            onClick={() => {
              if (canGoNext) moveExercise("next");
              else confirmCurrentSetAndRest();
            }}
          >
            {canGoNext ? (
              <>
                <ChevronRight className="h-5 w-5" />
                Siguiente ejercicio
              </>
            ) : (
              <>
                <Pause className="h-5 w-5" />
                Registrar serie y descansar
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-12 w-12 shrink-0 rounded-2xl border border-white/10 bg-[#151a28] px-0 hover:bg-[#1c2233]"
            onClick={() => moveExercise("next")}
            aria-label="Siguiente ejercicio"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <p className="relative mt-3 text-center text-[11px] text-[var(--muted)]">
          El ejercicio se completa al registrar todas las series.
        </p>
      </Card>
    </motion.div>
  );
}
