"use client";

import { useMemo, useId } from "react";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useLiveWorkoutDerived } from "@/modules/training/hooks/use-live-workout-derived";
import { useTrainingStore } from "@/modules/training/store/use-training-store";

export function LiveWorkoutSummaryCard() {
  const gradientId = useId().replace(/:/g, "");
  const { inLiveWorkoutSession, totalCompletedSets, totalTargetSets, done, sessionExercises, sessionProgress, seriesProgressPercent, exerciseContextById, completedSetsByExerciseId } =
    useLiveWorkoutDerived();
  const sessionElapsedSeconds = useTrainingStore((s) => s.sessionElapsedSeconds);

  const { volumeKg, estKcal } = useMemo(() => {
    let vol = 0;
    for (const ex of sessionExercises) {
      const target = exerciseContextById[ex.id]?.params.sets ?? 4;
      const c = Math.min(completedSetsByExerciseId[ex.id] ?? 0, target);
      vol += c * ex.weight;
    }
    const kcal = Math.round(totalCompletedSets * 4.5 + sessionElapsedSeconds * 0.12);
    return { volumeKg: Math.round(vol), estKcal: kcal };
  }, [sessionExercises, exerciseContextById, completedSetsByExerciseId, totalCompletedSets, sessionElapsedSeconds]);

  const r = 22;
  const c = 2 * Math.PI * r;
  const pct = seriesProgressPercent;
  const dash = c * (1 - pct / 100);

  return (
    <Card className="relative overflow-hidden border-violet-500/25 bg-gradient-to-br from-[#10152a]/95 to-[#080c14]/95 p-3.5 backdrop-blur-md">
      <div className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-fuchsia-600/10 blur-2xl" aria-hidden />
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {inLiveWorkoutSession ? "Resumen rápido" : "Progreso sesión"}
      </p>
      <div className="mt-2 space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Series completadas</span>
          <span className="font-semibold tabular-nums text-white">{totalCompletedSets}/{totalTargetSets || "—"}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Ejercicios completados</span>
          <span className="font-semibold tabular-nums text-white">{done}/{sessionExercises.length || 0}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Volumen total</span>
          <span className="font-semibold tabular-nums text-white">{volumeKg.toLocaleString("es-ES")} kg</span>
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Calorías estimadas</span>
          <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-amber-200/90">
            <Flame className="h-3.5 w-3.5" /> {estKcal}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-2.5 py-2">
        <div className="text-xs text-zinc-400">
          <p>Progreso total</p>
          <p className="mt-0.5 text-sm font-semibold text-white">{sessionProgress}%</p>
        </div>
        <div className="relative h-14 w-14 shrink-0">
          <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <circle cx="28" cy="28" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
            <motion.circle
              cx="28"
              cy="28"
              r={r}
              stroke={`url(#${gradientId})`}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={c}
              initial={false}
              animate={{ strokeDashoffset: dash }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
              style={{ filter: "drop-shadow(0 0 10px rgba(124,58,237,0.4))" }}
            />
          </svg>
        </div>
      </div>
    </Card>
  );
}
