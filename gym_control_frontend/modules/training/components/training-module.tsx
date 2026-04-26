"use client";

import type { ModuleShellProps } from "@/lib/module-shell-props";
import { ExerciseDetailDialog } from "@/modules/training/components/exercise-detail-dialog";
import { NutritionDayModal } from "@/modules/training/components/nutrition-day-modal";
import { RoutineExerciseDetailDialog } from "@/modules/training/components/routine-exercise-detail-dialog";
import { TrainingProShell } from "@/modules/training/components/training-pro-shell";
import { TrainingDayModal } from "@/modules/training/components/training-day-modal";
import { WorkoutModeLiveShell } from "@/modules/training/components/workout-mode-live-shell";
import { useTrainingModuleBootstrap } from "@/modules/training/hooks/use-training-module-bootstrap";
import { useTrainingModuleStore } from "@/modules/training/stores/use-training-module-store";

function TrainingModuleDialogs() {
  return (
    <>
      <ExerciseDetailDialog />
      <NutritionDayModal />
      <TrainingDayModal />
      <RoutineExerciseDetailDialog />
    </>
  );
}

export function TrainingModule({ role: _role }: ModuleShellProps) {
  useTrainingModuleBootstrap();
  const { isWorkoutMode } = useTrainingModuleStore();

  if (isWorkoutMode) {
    return (
      <div className="-mb-28 md:-mb-6">
        <WorkoutModeLiveShell />
        <TrainingModuleDialogs />
      </div>
    );
  }

  // Vista PRO (mockup) para el modo normal: sesión + descanso + nutrición en 3 columnas.
  return (
    <div className="-mb-28 md:-mb-6">
      <TrainingProShell />
      <TrainingModuleDialogs />
    </div>
  );
}
