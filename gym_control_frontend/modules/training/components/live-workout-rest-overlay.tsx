"use client";

import { useId } from "react";
import { Pause, Play, Plus, SkipForward } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { formatClock } from "@/modules/training/services/training-module.utils";
import { useTrainingStore } from "@/modules/training/store/use-training-store";

export function LiveWorkoutRestOverlay() {
  const restRingGradientId = useId().replace(/:/g, "");
  const { restSeconds, restInitialTotal, isRestPaused, setRestSeconds, setRestInitialTotal, setIsRestPaused, setIsRestRunning } =
    useTrainingStore(
      useShallow((state) => ({
        restSeconds: state.restSeconds,
        restInitialTotal: state.restInitialTotal,
        isRestPaused: state.isRestPaused,
        setRestSeconds: state.setRestSeconds,
        setRestInitialTotal: state.setRestInitialTotal,
        setIsRestPaused: state.setIsRestPaused,
        setIsRestRunning: state.setIsRestRunning,
      })),
    );

  const ringRadius = 104;
  const circumference = 2 * Math.PI * ringRadius;
  const denominator = Math.max(restInitialTotal, 1);
  const progress = Math.min(1, Math.max(0, restSeconds / denominator));
  const offset = circumference * (1 - progress);
  const elapsed = Math.max(0, restInitialTotal - restSeconds);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex flex-col bg-[#0B0E14]/95 text-white backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 90% 55% at 50% 12%, rgba(124,58,237,0.45), transparent 58%), radial-gradient(ellipse 50% 45% at 12% 88%, rgba(45,212,191,0.22), transparent 52%), radial-gradient(ellipse 45% 40% at 92% 78%, rgba(168,85,247,0.25), transparent 48%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.04%22/%3E%3C/svg%3E')]" />

        <div className="relative flex flex-1 flex-col items-center justify-center px-5 pb-10 pt-10">
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-semibold uppercase tracking-[0.32em] text-teal-300/90"
          >
            Descanso activo
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-2 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Recupera con intención
          </motion.h2>
          <p className="mt-1 text-center text-sm text-zinc-400">
            <span className="font-mono tabular-nums text-teal-200">{formatClock(restSeconds)}</span>
            <span className="mx-2 text-zinc-600">de</span>
            <span className="font-mono tabular-nums text-zinc-500">{formatClock(restInitialTotal)}</span>
          </p>

          <div className="relative mt-8 flex h-[268px] w-[268px] shrink-0 items-center justify-center sm:mt-10 sm:h-[288px] sm:w-[288px]">
            <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 240 240" aria-hidden>
              <defs>
                <linearGradient id={restRingGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="50%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
              <circle cx="120" cy="120" r={ringRadius} stroke="rgba(255,255,255,0.06)" strokeWidth="14" fill="none" />
              <circle
                cx="120"
                cy="120"
                r={ringRadius}
                stroke={`url(#${restRingGradientId})`}
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                style={{ filter: "drop-shadow(0 0 22px rgba(124,58,237,0.55))" }}
              />
            </svg>
            <div className="relative flex flex-col items-center">
              <span className="text-5xl font-bold tabular-nums tracking-tight text-white sm:text-6xl">{formatClock(restSeconds)}</span>
              <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                {isRestPaused ? "Pausado" : "En curso"}
              </span>
              <span className="mt-1 text-xs text-zinc-500">
                Transcurrido <span className="tabular-nums text-zinc-300">{formatClock(elapsed)}</span>
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
          >
            <button
              type="button"
              onClick={() => {
                setRestSeconds((prev) => prev + 15);
                setRestInitialTotal((prev) => prev + 15);
              }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white shadow-lg transition hover:border-teal-400/40 hover:bg-teal-500/10"
              aria-label="Añadir 15 segundos al descanso"
              title="+15 segundos"
            >
              <Plus className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsRestPaused((prev) => !prev)}
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-teal-400 via-violet-500 to-fuchsia-600 text-white shadow-[0_0_48px_rgba(124,58,237,0.55)] transition hover:brightness-110"
              aria-label={isRestPaused ? "Reanudar descanso" : "Pausar descanso"}
            >
              {isRestPaused ? <Play className="h-8 w-8 pl-0.5" /> : <Pause className="h-8 w-8" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRestRunning(false);
                setIsRestPaused(false);
                setRestSeconds(0);
              }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-100 transition hover:bg-rose-500/20"
              aria-label="Saltar descanso"
              title="Saltar descanso"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </motion.div>

          <p className="mt-10 max-w-sm pb-[env(safe-area-inset-bottom)] text-center text-xs leading-relaxed text-zinc-500">
            +15s para extender · Pausa si necesitas hidratarte · Saltar solo si ya estás listo
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
