"use client";

import { LiveWorkoutRestCompact } from "@/modules/training/components/live-workout-rest-compact";
import { LiveWorkoutSummaryCard } from "@/modules/training/components/live-workout-summary-card";

/**
 * Columna central del mockup: descanso + resumen (sin lógica extra).
 */
export function LiveWorkoutStatusColumn() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <LiveWorkoutRestCompact />
      <LiveWorkoutSummaryCard />
    </div>
  );
}
