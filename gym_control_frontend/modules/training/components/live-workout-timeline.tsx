"use client";

import { Card } from "@/components/ui/card";
import { useLiveWorkoutDerived } from "@/modules/training/hooks/use-live-workout-derived";
import { formatClock } from "@/modules/training/services/training-module.utils";
import { useTrainingStore } from "@/modules/training/store/use-training-store";
import { useShallow } from "zustand/react/shallow";
import { useMemo } from "react";

type Variant = "strip" | "list";

function useTimelineSteps() {
  const { sessionExercises, activeExerciseIndex, inLiveWorkoutSession, exerciseContextById } = useLiveWorkoutDerived();
  const { completedSetsByExerciseId, setActiveExerciseIndex, setSelectedExerciseId } = useTrainingStore(
    useShallow((state) => ({
      completedSetsByExerciseId: state.completedSetsByExerciseId,
      setActiveExerciseIndex: state.setActiveExerciseIndex,
      setSelectedExerciseId: state.setSelectedExerciseId,
    })),
  );

  const isExerciseCompleted = (exerciseId: string) => {
    const target = exerciseContextById[exerciseId]?.params.sets ?? 4;
    return (completedSetsByExerciseId[exerciseId] ?? 0) >= target;
  };

  const stripItems = useMemo(() => {
    const items: { time: string; label: string; kind: "start" | "exercise" }[] = [
      { time: "0:00", label: "Inicio de sesión", kind: "start" },
    ];
    let acc = 0;
    sessionExercises.forEach((ex, i) => {
      acc += 90 + i * 15;
      items.push({ time: formatClock(acc), label: ex.exercise, kind: "exercise" });
    });
    return items;
  }, [sessionExercises]);

  return {
    sessionExercises,
    activeExerciseIndex,
    inLiveWorkoutSession,
    exerciseContextById,
    completedSetsByExerciseId,
    isExerciseCompleted,
    setActiveExerciseIndex,
    setSelectedExerciseId,
    stripItems,
  };
}

export function LiveWorkoutTimeline({ variant = "strip" }: { variant?: Variant }) {
  const t = useTimelineSteps();
  if (variant === "strip") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e18]/80 px-3 py-3 shadow-[0_4px_32px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">Línea de tiempo de la sesión</p>
        <div className="mt-2 flex items-stretch gap-0 overflow-x-auto pb-1 pt-1 [scrollbar-width:thin]">
          {t.stripItems.map((item, idx) => {
            const exIdx = item.kind === "exercise" ? idx - 1 : -1;
            const isCurrent = item.kind === "exercise" && exIdx === t.activeExerciseIndex;
            return (
              <div key={`${item.label}-${idx}`} className="flex min-w-0 items-stretch">
                {idx > 0 ? <div className="mx-1 w-4 shrink-0 self-center border-t border-dotted border-cyan-500/35" /> : null}
                <div
                  className={`min-w-[7.5rem] max-w-[9rem] rounded-xl border px-2.5 py-2 ${
                    isCurrent
                      ? "border-cyan-400/45 bg-cyan-500/10"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <p className="text-[9px] font-mono text-cyan-300/90">{item.time}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs font-medium leading-snug text-white">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Card
      className={`relative hidden shrink-0 overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.05] to-[#0B0E14] p-4 shadow-[0_4px_40px_rgba(0,0,0,0.35)] backdrop-blur-md xl:w-full ${
        t.inLiveWorkoutSession ? "" : "xl:block"
      }`}
    >
      <div
        className="pointer-events-none absolute left-[21px] top-16 bottom-8 w-px bg-gradient-to-b from-cyan-400/50 via-violet-500/40 to-transparent"
        aria-hidden
      />
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Línea de tiempo</p>
      <p className="mt-1 text-xs text-zinc-500">Cambio de ejercicio</p>
      <div className="relative mt-4 max-h-[50vh] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
        {t.sessionExercises.map((exercise, index) => {
          const isCurrent = t.activeExerciseIndex === index;
          const isCompleted = t.isExerciseCompleted(exercise.id);
          const statusLabel = isCurrent ? "En curso" : isCompleted ? "Hecho" : "Pendiente";
          return (
            <button
              key={`timeline-${exercise.id}`}
              type="button"
              className={`relative ml-1 w-full rounded-2xl border p-3 pl-4 text-left transition ${
                isCurrent
                  ? "border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_20px_rgba(45,212,191,0.15)]"
                  : isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
              onClick={() => {
                t.setActiveExerciseIndex(index);
                t.setSelectedExerciseId(exercise.id);
              }}
            >
              <span
                className={`absolute left-2 top-4 h-2.5 w-2.5 rounded-full border-2 ${
                  isCurrent
                    ? "border-cyan-300 bg-cyan-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                    : isCompleted
                      ? "border-emerald-300 bg-emerald-400/80"
                      : "border-zinc-600 bg-zinc-800"
                }`}
              />
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{statusLabel}</p>
              <p className="text-sm font-semibold text-white">{exercise.exercise}</p>
              <p className="text-xs text-zinc-500">
                {exercise.reps} reps · {exercise.weight} kg
              </p>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
