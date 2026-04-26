"use client";

import { useTrainingModuleStore } from "@/modules/training/stores/use-training-module-store";
import type { TrainingModuleStore } from "@/modules/training/stores/use-training-module-store";
import { useShallow } from "zustand/react/shallow";

export function useTrainingStore<T>(selector: (state: TrainingModuleStore) => T): T {
  return useTrainingModuleStore(useShallow((state: TrainingModuleStore) => selector(state)));
}
