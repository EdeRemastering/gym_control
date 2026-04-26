"use client";

import { LiveWorkoutProSessionLayout } from "@/modules/training/components/live-workout-pro-session-layout";
import { NutritionDetailPanels } from "@/modules/training/components/nutrition-detail-panels";
import { useTrainingStore } from "@/modules/training/store/use-training-store";

/**
 * Conmuta entre el layout PRO de entreno en vivo y el panel de nutrición.
 */
export function WorkoutModeLiveArena() {
  const trainingTab = useTrainingStore((s) => s.trainingTab);
  if (trainingTab === "nutrition") {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto p-3 md:p-5">
        <NutritionDetailPanels />
      </div>
    );
  }
  return <LiveWorkoutProSessionLayout />;
}
