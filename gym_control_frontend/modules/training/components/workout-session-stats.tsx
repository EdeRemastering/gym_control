"use client";

import { Activity, Clock, Flame, Weight } from "lucide-react";
import { motion } from "framer-motion";
import { useLiveWorkoutDerived } from "@/modules/training/hooks/use-live-workout-derived";
import { useTrainingStore } from "@/modules/training/store/use-training-store";
import { formatClock } from "@/modules/training/services/training-module.utils";

export function WorkoutSessionStats() {
  const { totalCompletedSets, totalTargetSets, seriesProgressPercent, sessionExercises, exerciseContextById, completedSetsByExerciseId } =
    useLiveWorkoutDerived();
  const sessionElapsedSeconds = useTrainingStore((s) => s.sessionElapsedSeconds);

  const density = sessionExercises.length ? (totalCompletedSets / Math.max(sessionElapsedSeconds / 60, 0.01)).toFixed(1) : "0";
  const vol = sessionExercises.reduce((acc, ex) => {
    const t = exerciseContextById[ex.id]?.params.sets ?? 4;
    const c = Math.min(completedSetsByExerciseId[ex.id] ?? 0, t);
    return acc + c * ex.weight;
  }, 0);

  const items = [
    {
      icon: Activity,
      label: "Intensidad sesión",
      value: `${seriesProgressPercent}%`,
      sub: "del plan de series",
      color: "text-cyan-300",
    },
    {
      icon: Weight,
      label: "Volumen",
      value: `${Math.round(vol).toLocaleString("es-ES")} kg`,
      sub: "acumulado",
      color: "text-violet-300",
    },
    {
      icon: Clock,
      label: "Densidad",
      value: `${density} sets/min`,
      sub: "aprox.",
      color: "text-amber-200/90",
    },
    {
      icon: Flame,
      label: "Tempo",
      value: formatClock(sessionElapsedSeconds),
      sub: "tiempo total",
      color: "text-rose-200/90",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="flex items-center gap-2">
            <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{item.label}</p>
          </div>
          <p className="mt-2 text-lg font-bold tabular-nums text-white">{item.value}</p>
          <p className="text-[10px] text-zinc-500">
            {item.sub} · {totalCompletedSets}/{totalTargetSets || "—"} series
          </p>
        </motion.div>
      ))}
    </div>
  );
}
