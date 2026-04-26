"use client";

import { Utensils, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShallow } from "zustand/react/shallow";
import { useFinalizeWorkoutSessionOnServer } from "@/modules/training/hooks/use-training-optimistic";
import { useLiveWorkoutDerived } from "@/modules/training/hooks/use-live-workout-derived";
import { formatClock } from "@/modules/training/services/training-module.utils";
import { useWorkoutStore } from "@/modules/training/store/use-workout-store";
import { useUIStore } from "@/modules/ui/store/use-ui-store";

export function WorkoutModeTopbar() {
  const { inLiveWorkoutSession, selectedRoutineName, sessionExercises, focusExerciseContext } = useLiveWorkoutDerived();
  const finalizeOnServer = useFinalizeWorkoutSessionOnServer();
  const { sessionElapsedSeconds, setIsWorkoutMode, setIsRestRunning, setIsRestPaused, setActiveWorkoutSessionId } =
    useWorkoutStore(
      useShallow((state) => ({
        sessionElapsedSeconds: state.sessionElapsedSeconds,
        setIsWorkoutMode: state.setIsWorkoutMode,
        setIsRestRunning: state.setIsRestRunning,
        setIsRestPaused: state.setIsRestPaused,
        setActiveWorkoutSessionId: state.setActiveWorkoutSessionId,
      })),
    );
  const setTrainingTab = useUIStore((state) => state.setTrainingTab);

  const exitWorkoutMode = async () => {
    await finalizeOnServer();
    setIsWorkoutMode(false);
    setIsRestRunning(false);
    setIsRestPaused(false);
    setActiveWorkoutSessionId(null);
  };

  const estMinutes = Math.max(20, (sessionExercises.length || 1) * 11);
  const metaLine = focusExerciseContext
    ? `${focusExerciseContext.objective} · ~${estMinutes} min`
    : `Sesión estructurada · ~${estMinutes} min`;

  if (inLiveWorkoutSession) {
    return (
      <header className="relative border-b border-white/10 bg-[#060a14]/95 px-3 py-2.5 md:px-5 md:py-3">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-950/35 via-cyan-950/10 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="shrink-0 border border-rose-500/50 bg-rose-500/5 text-rose-100 hover:bg-rose-500/15"
              onClick={() => void exitWorkoutMode()}
            >
              Terminar sesión
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                </span>
                <span className="text-[10px] font-extrabold tracking-[0.2em] text-zinc-300">ENTRENAMIENTO EN VIVO</span>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                  Sesión activa
                </span>
              </div>
              <h1 className="mt-1 truncate text-base font-bold leading-tight text-white md:text-lg">{selectedRoutineName}</h1>
              <p className="mt-0.5 text-[11px] text-zinc-500">{metaLine}</p>
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-right">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Tiempo total</p>
              <p className="mt-0.5 font-mono text-xl font-bold tabular-nums tracking-tight text-white md:text-2xl">
                {formatClock(sessionElapsedSeconds)}
              </p>
            </div>
            <Button
              type="button"
              className="h-10 shrink-0 border border-violet-300/20 bg-[#7c3aed] px-4 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.45)] transition-transform hover:-translate-y-0.5 hover:bg-[#6d28d9]"
              onClick={() => setTrainingTab("nutrition")}
            >
              <Utensils className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Nutrición</span>
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <div className="relative border-b border-white/10 bg-[#0B0E14] px-3 py-3 md:px-5">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-300/30 to-transparent" />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="shrink-0 gap-1 text-zinc-300 hover:text-white"
          onClick={() => setTrainingTab("session")}
        >
          <Dumbbell className="h-4 w-4" />
          <span>Entreno</span>
        </Button>
        <p className="min-w-0 flex-1 text-center text-sm font-semibold text-white md:text-base">Nutrición</p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shrink-0 border border-rose-500/50 text-rose-100 hover:bg-rose-500/10"
          onClick={() => void exitWorkoutMode()}
        >
          Terminar sesión
        </Button>
      </div>
    </div>
  );
}
