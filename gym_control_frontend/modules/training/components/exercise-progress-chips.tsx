"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import type { ExerciseContext } from "@/modules/training/types/training-module.types";
import type { SessionExercise } from "@/modules/training/types/training-module.types";
import { useShallow } from "zustand/react/shallow";
import { useTrainingStore } from "@/modules/training/store/use-training-store";

type Props = {
  sessionExercises: SessionExercise[];
  activeExerciseIndex: number;
  completedSetsByExerciseId: Record<string, number>;
  exerciseContextById: Record<string, ExerciseContext>;
};

export function ExerciseProgressChips({ sessionExercises, activeExerciseIndex, completedSetsByExerciseId, exerciseContextById }: Props) {
  const { setActiveExerciseIndex, setSelectedExerciseId } = useTrainingStore(
    useShallow((s) => ({
      setActiveExerciseIndex: s.setActiveExerciseIndex,
      setSelectedExerciseId: s.setSelectedExerciseId,
    })),
  );

  if (!sessionExercises.length) {
    return <p className="text-center text-sm text-zinc-500">Sin bloque de ejercicios.</p>;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
      {sessionExercises.map((ex, index) => {
        const target = exerciseContextById[ex.id]?.params.sets ?? 4;
        const done = Math.min(completedSetsByExerciseId[ex.id] ?? 0, target);
        const isCurrent = index === activeExerciseIndex;
        const isComplete = done >= target;

        return (
          <motion.button
            key={ex.id}
            type="button"
            initial={false}
            animate={{ scale: isCurrent ? 1.02 : 1 }}
            onClick={() => {
              setActiveExerciseIndex(index);
              setSelectedExerciseId(ex.id);
            }}
            className={`shrink-0 rounded-xl border px-3 py-2 text-left text-sm transition ${
              isCurrent
                ? "border-cyan-400/45 bg-gradient-to-br from-violet-600/35 to-cyan-500/15 shadow-[0_0_20px_rgba(45,212,191,0.18)]"
                : isComplete
                  ? "border-emerald-500/35 bg-emerald-500/10"
                  : "border-white/10 bg-[#0d1322] hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-zinc-300">{index + 1}</span>
              {isComplete ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <span className="h-2 w-2 rounded-full bg-zinc-500" />}
            </div>
            <p className={`mt-1 line-clamp-1 max-w-[7.5rem] text-xs font-semibold ${isCurrent ? "text-white" : "text-zinc-200"}`}>
              {ex.exercise}
            </p>
            <p className="mt-0.5 text-[10px] font-mono text-zinc-400">
              {done}/{target}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
