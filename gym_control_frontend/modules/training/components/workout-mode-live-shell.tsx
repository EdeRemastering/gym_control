"use client";

import { LiveWorkoutMobileControls } from "@/modules/training/components/live-workout-mobile-controls";
import { LiveWorkoutRestOverlay } from "@/modules/training/components/live-workout-rest-overlay";
import { TrainingNutritionTabs } from "@/modules/training/components/training-nutrition-tabs";
import { WorkoutModeLiveArena } from "@/modules/training/components/workout-mode-live-arena";
import { WorkoutModeTopbar } from "@/modules/training/components/workout-mode-topbar";
import { useWorkoutStore } from "@/modules/training/store/use-workout-store";

/**
 * Contenedor de modo entrenamiento: solo compone secciones, sin lógica de negocio.
 */
export function WorkoutModeLiveShell() {
  const isRestRunning = useWorkoutStore((s) => s.isRestRunning);
  return (
    <div className="relative flex min-h-[min(100dvh,920px)] flex-col overflow-hidden border border-white/10 bg-[#050814] text-zinc-100 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% -10%, rgba(124,58,237,0.30), transparent 56%), radial-gradient(ellipse 50% 35% at 100% 0%, rgba(34,211,238,0.14), transparent 52%), radial-gradient(ellipse 55% 35% at 0% 100%, rgba(45,212,191,0.10), transparent 52%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:22px_22px]" />
      <WorkoutModeTopbar />
      <TrainingNutritionTabs />
      <WorkoutModeLiveArena />
      {isRestRunning ? <LiveWorkoutRestOverlay /> : null}
      <LiveWorkoutMobileControls />
    </div>
  );
}
