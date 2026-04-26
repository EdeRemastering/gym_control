"use client";

import { ChevronLeft, ChevronRight, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePersistWorkoutSet } from "@/modules/training/hooks/use-training-optimistic";
import { useLiveWorkoutDerived } from "@/modules/training/hooks/use-live-workout-derived";
import { parseRepsWeightForSetLog, parseRestToSeconds } from "@/modules/training/services/training-module.utils";
import { useShallow } from "zustand/react/shallow";
import { useTrainingModuleStore } from "@/modules/training/stores/use-training-module-store";
import { useTrainingStore } from "@/modules/training/store/use-training-store";

export function LiveWorkoutMobileControls() {
  const persistSet = usePersistWorkoutSet();
  const { sessionExercises, activeExerciseIndex, focusExercise, focusExerciseContext, completedSetsByExerciseId, inLiveWorkoutSession } =
    useLiveWorkoutDerived();
  const {
    setActiveExerciseIndex,
    setSelectedExerciseId,
    setCompletedSetsByExerciseId,
    setRestInitialTotal,
    setRestSeconds,
    setIsRestPaused,
    setIsRestRunning,
  } = useTrainingStore(
    useShallow((state) => ({
      setActiveExerciseIndex: state.setActiveExerciseIndex,
      setSelectedExerciseId: state.setSelectedExerciseId,
      setCompletedSetsByExerciseId: state.setCompletedSetsByExerciseId,
      setRestInitialTotal: state.setRestInitialTotal,
      setRestSeconds: state.setRestSeconds,
      setIsRestPaused: state.setIsRestPaused,
      setIsRestRunning: state.setIsRestRunning,
    })),
  );
  const safeCompletedSetsByExerciseId = completedSetsByExerciseId ?? {};

  if (!inLiveWorkoutSession || !focusExercise || !focusExerciseContext) return null;

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
    const doneHere = safeCompletedSetsByExerciseId[focusExercise.id] ?? 0;
    if (doneHere >= target) return;
    const rest = parseRestToSeconds(focusExerciseContext.params.rest);
    const row =
      useTrainingModuleStore.getState().setRowDrafts[doneHere] ?? {
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
      [focusExercise.id]: doneHere + 1,
    }));
    setRestInitialTotal(rest);
    setRestSeconds(rest);
    setIsRestPaused(false);
    setIsRestRunning(true);
  };

  const target = focusExerciseContext.params.sets;
  const doneHere = safeCompletedSetsByExerciseId[focusExercise.id] ?? 0;
  const canMoveNext = doneHere >= target;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[45] border-t border-white/10 bg-[#0B0E14]/95 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <div className="mx-auto mb-2 flex max-w-lg items-center justify-center">
        <div className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200">
          Set actual: {doneHere}/{target}
        </div>
      </div>
      <div className="mx-auto flex max-w-lg items-stretch gap-1.5 sm:gap-2">
        <Button
          type="button"
          variant="secondary"
          className="h-14 w-14 shrink-0 rounded-2xl border border-white/10 bg-[#151a28] px-0"
          onClick={() => moveExercise("prev")}
          aria-label="Ejercicio anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          type="button"
          variant="primary"
          className="h-14 min-w-0 flex-1 gap-1.5 rounded-2xl border border-violet-300/20 bg-[#7c3aed] px-2 text-sm font-bold shadow-[0_8px_28px_rgba(124,58,237,0.45)] hover:bg-[#6d28d9] sm:gap-2 sm:px-3 sm:text-base"
          onClick={() => {
            if (canMoveNext) moveExercise("next");
            else confirmCurrentSetAndRest();
          }}
        >
          {canMoveNext ? (
            <>
              <ChevronRight className="h-6 w-6" />
              Siguiente
            </>
          ) : (
            <>
              <Pause className="h-6 w-6" />
              <span className="truncate">Registrar serie y descansar</span>
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-14 w-14 shrink-0 rounded-2xl border border-white/10 bg-[#151a28] px-0"
          onClick={() => moveExercise("next")}
          aria-label="Siguiente ejercicio"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
