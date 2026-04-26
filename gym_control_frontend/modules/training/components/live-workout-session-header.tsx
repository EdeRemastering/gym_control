"use client";

import { Timer } from "lucide-react";
import { motion } from "framer-motion";
import { ExerciseProgressChips } from "@/modules/training/components/exercise-progress-chips";
import { useLiveWorkoutDerived } from "@/modules/training/hooks/use-live-workout-derived";
import { getCurrentWeekDay } from "@/modules/training/services/training-module.utils";
import { formatClock } from "@/modules/training/services/training-module.utils";
import { useTrainingStore } from "@/modules/training/store/use-training-store";

export function LiveWorkoutSessionHeader() {
  const {
    inLiveWorkoutSession,
    totalCompletedSets,
    totalTargetSets,
    seriesProgressPercent,
    done,
    sessionExercises,
    activeExerciseIndex,
    completedSetsByExerciseId,
    exerciseContextById,
    selectedRoutineName,
    sessionProgress,
  } = useLiveWorkoutDerived();
  const sessionElapsedSeconds = useTrainingStore((state) => state.sessionElapsedSeconds);
  const sessionElapsedLabel = formatClock(sessionElapsedSeconds);
  const todayWeekDay = getCurrentWeekDay();

  const activeDisplay = sessionExercises.length ? activeExerciseIndex + 1 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 shadow-[0_4px_40px_rgba(0,0,0,0.35)] backdrop-blur-md md:px-5"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#7c3aed]/10 via-transparent to-[#2dd4bf]/10"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {inLiveWorkoutSession ? (
            <>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                Sesión en curso
              </p>
              <p className="mt-1 text-[11px] font-medium text-zinc-400">
                Hoy: <span className="text-zinc-200">{todayWeekDay}</span>
              </p>
              <p className="text-sm font-semibold text-white">
                <span className="text-[#2dd4bf]">Ejercicio {activeDisplay}</span> de {sessionExercises.length || 0}
                <span className="mx-2 text-zinc-600">|</span>
                <span className="text-[#a78bfa]">{sessionProgress}%</span> completado
              </p>
              <div className="mt-3 h-2.5 w-full max-w-2xl overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#7c3aed]"
                  initial={false}
                  animate={{ width: `${seriesProgressPercent}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-400">
                <span>
                  Series completadas{" "}
                  <span className="font-semibold tabular-nums text-white">
                    {totalCompletedSets}/{totalTargetSets || "—"}
                  </span>
                </span>
                <span className="text-zinc-600">|</span>
                <span>
                  Ejercicios completados{" "}
                  <span className="font-semibold tabular-nums text-white">
                    {done}/{sessionExercises.length || 0}
                  </span>
                </span>
              </div>
              <p className="mt-2 text-[11px] text-zinc-500 sm:hidden">
                <Timer className="mr-1 inline h-3.5 w-3.5 align-text-bottom text-[#2dd4bf]" />
                {sessionElapsedLabel} sesión
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-200/90">Sesión activa</p>
              <h2 className="mt-1 text-lg font-semibold leading-tight text-white md:text-xl">{selectedRoutineName}</h2>
            </>
          )}
        </div>
        <div className="hidden shrink-0 sm:block">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Tiempo total</p>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-lg font-bold tabular-nums text-white">
            <Timer className="h-4 w-4 text-[#2dd4bf]" />
            {sessionElapsedLabel}
          </div>
        </div>
      </div>

      <div className="relative mt-4 border-t border-white/10 pt-3">
        <ExerciseProgressChips
          sessionExercises={sessionExercises}
          activeExerciseIndex={activeExerciseIndex}
          completedSetsByExerciseId={completedSetsByExerciseId ?? {}}
          exerciseContextById={exerciseContextById ?? {}}
        />
      </div>
    </motion.div>
  );
}
