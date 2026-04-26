"use client";

import { useId } from "react";
import { Pause, Play, Plus, SkipForward } from "lucide-react";
import { formatClock } from "@/modules/training/services/training-module.utils";
import { useTrainingStore } from "@/modules/training/store/use-training-store";
import { useShallow } from "zustand/react/shallow";

/**
 * Minireloj de descanso (columna central). Misma lógica de estado que `LiveWorkoutRestOverlay`.
 */
export function LiveWorkoutRestCompact() {
  const restRingGradientId = useId().replace(/:/g, "");
  const { restSeconds, restInitialTotal, isRestRunning, isRestPaused, setRestSeconds, setRestInitialTotal, setIsRestPaused, setIsRestRunning } =
    useTrainingStore(
      useShallow((s) => ({
        restSeconds: s.restSeconds,
        restInitialTotal: s.restInitialTotal,
        isRestRunning: s.isRestRunning,
        isRestPaused: s.isRestPaused,
        setRestSeconds: s.setRestSeconds,
        setRestInitialTotal: s.setRestInitialTotal,
        setIsRestPaused: s.setIsRestPaused,
        setIsRestRunning: s.setIsRestRunning,
      })),
    );

  const ringRadius = 68;
  const circumference = 2 * Math.PI * ringRadius;
  const denominator = Math.max(restInitialTotal, 1);
  const progress = isRestRunning ? Math.min(1, Math.max(0, restSeconds / denominator)) : 0;
  const offset = circumference * (1 - progress);
  const elapsed = Math.max(0, restInitialTotal - restSeconds);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#12192b] to-[#0b111d] p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(124,58,237,0.2),transparent_55%)]"
        aria-hidden
      />
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">Descanso</p>
      <p className="mt-0.5 text-sm font-medium text-zinc-500">
        <span className="font-mono tabular-nums text-white">{formatClock(isRestRunning ? restSeconds : restInitialTotal || 0)}</span>
        <span className="text-zinc-600"> de </span>
        <span className="font-mono tabular-nums text-zinc-400">{formatClock(restInitialTotal || 0)}</span>
      </p>
      <div className="relative mx-auto mt-2 flex h-[164px] w-[164px] shrink-0 items-center justify-center">
        <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 240 240" aria-hidden>
          <defs>
            <linearGradient id={restRingGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <circle cx="120" cy="120" r={ringRadius} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
          <circle
            cx="120"
            cy="120"
            r={ringRadius}
            stroke={`url(#${restRingGradientId})`}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            style={{ filter: isRestRunning ? "drop-shadow(0 0 16px rgba(124,58,237,0.5))" : "none" }}
            opacity={isRestRunning || restInitialTotal > 0 ? 1 : 0.35}
          />
        </svg>
        <div className="relative flex flex-col items-center text-center">
          <span className="text-3xl font-bold tabular-nums tracking-tight text-white">
            {isRestRunning ? formatClock(restSeconds) : "—"}
          </span>
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            {isRestPaused ? "Pausa" : isRestRunning ? "En curso" : "Inactivo"}
          </span>
          {isRestRunning ? (
            <span className="mt-0.5 text-[10px] text-zinc-500">
              Transcurrido <span className="tabular-nums text-zinc-300">{formatClock(elapsed)}</span>
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (!isRestRunning) return;
            setRestSeconds((prev) => prev + 15);
            setRestInitialTotal((prev) => prev + 15);
          }}
          className="flex h-8 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition hover:border-teal-400/40 hover:bg-teal-500/10 disabled:opacity-30"
          disabled={!isRestRunning}
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => (isRestRunning ? setIsRestPaused((p) => !p) : undefined)}
          disabled={!isRestRunning}
          className="flex h-9 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 via-violet-500 to-fuchsia-600 text-white shadow-lg disabled:opacity-40"
        >
          {isRestPaused || !isRestRunning ? <Play className="h-5 w-5 pl-0.5" /> : <Pause className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRestRunning(false);
            setIsRestPaused(false);
            setRestSeconds(0);
          }}
          className="flex h-8 w-11 items-center justify-center rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-100"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          setIsRestRunning(false);
          setIsRestPaused(false);
          setRestSeconds(0);
        }}
        className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] py-1.5 text-center text-[11px] font-medium text-zinc-300 transition hover:bg-white/[0.06]"
      >
        Saltar descanso
      </button>
    </div>
  );
}
