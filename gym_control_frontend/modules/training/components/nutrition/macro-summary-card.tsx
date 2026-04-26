"use client";

import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  totalKcal: number;
  protein: number;
  carbs: number;
  fats: number;
  /** Objetivo diario aproximado de kcal */
  kcalGoal?: number;
  className?: string;
};

const LABEL = {
  kcal: "Calorías",
  protein: "Proteína",
  carbs: "Carbos",
  fats: "Grasas",
} as const;

function Ring({
  value,
  goal,
  color,
  label,
  unit,
}: {
  value: number;
  goal: number;
  color: string;
  label: string;
  unit: string;
}) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  const dash = c * (1 - pct / 100);
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80" aria-hidden>
          <circle cx="40" cy="40" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
          <motion.circle
            cx="40"
            cy="40"
            r={r}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={false}
            animate={{ strokeDashoffset: dash }}
            transition={{ type: "spring", stiffness: 70, damping: 18 }}
            style={{ filter: "drop-shadow(0 0 6px currentColor)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-bold tabular-nums text-white">{Math.round(value)}</span>
          <span className="text-[9px] text-zinc-500">{unit}</span>
        </div>
      </div>
      <p className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
    </div>
  );
}

export function MacroSummaryCard({ totalKcal, protein, carbs, fats, kcalGoal = 2350, className = "" }: Props) {
  const gid = useId().replace(/:/g, "");
  const pGoal = 165;
  const cGoal = 275;
  const fGoal = 70;

  const dist = useMemo(() => {
    const sum = protein + carbs + fats;
    if (sum <= 0) return { p: 0, c: 0, f: 0 };
    return {
      p: (protein / sum) * 100,
      c: (carbs / sum) * 100,
      f: (fats / sum) * 100,
    };
  }, [protein, carbs, fats]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-[#0a0f18] p-4 backdrop-blur-md md:p-5",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.35),transparent_55%)]"
        aria-hidden
      />
      <div className="relative flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Balance de macros</p>
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-100/90">
          <Flame className="h-3 w-3" />
          {Math.round(kcalGoal)} kcal obj.
        </span>
      </div>
      <div className="relative mt-5 flex flex-wrap items-start justify-center gap-8 sm:justify-between sm:gap-4">
        <div className="flex flex-col items-center">
          <div className="relative h-28 w-28">
            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 80 80">
              <defs>
                <linearGradient id={`${gid}-k`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <circle cx="40" cy="40" r={36} stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
              <motion.circle
                cx="40"
                cy="40"
                r={36}
                stroke={`url(#${gid}-k)`}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 36}
                initial={false}
                animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - Math.min(1, totalKcal / kcalGoal)) }}
                transition={{ type: "spring", stiffness: 60, damping: 16 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-bold tabular-nums text-white">{Math.round(totalKcal)}</span>
              <span className="text-[9px] text-zinc-500">kcal</span>
            </div>
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{LABEL.kcal}</p>
        </div>
        <Ring value={protein} goal={pGoal} color="#a78bfa" label={LABEL.protein} unit="g" />
        <Ring value={carbs} goal={cGoal} color="#2dd4bf" label={LABEL.carbs} unit="g" />
        <Ring value={fats} goal={fGoal} color="#f472b6" label={LABEL.fats} unit="g" />
      </div>
      <p className="relative mt-4 text-center text-[11px] text-zinc-500">
        Distribución aprox. · P {dist.p.toFixed(0)}% · C {dist.c.toFixed(0)}% · G {dist.f.toFixed(0)}%
      </p>
    </div>
  );
}
