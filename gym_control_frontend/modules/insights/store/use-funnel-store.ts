"use client";

import { create } from "zustand";
import type { BehaviorFunnelStage, FunnelStage } from "@/modules/insights/types/insights.types";

interface FunnelState {
  conversion: FunnelStage[];
  behavior: BehaviorFunnelStage[];
  isLoading: boolean;
  setConversion: (stages: FunnelStage[]) => void;
  setBehavior: (stages: BehaviorFunnelStage[]) => void;
  setLoading: (v: boolean) => void;
}

export const useFunnelStore = create<FunnelState>((set) => ({
  conversion: [],
  behavior: [],
  isLoading: true,
  setConversion: (conversion) => set({ conversion }),
  setBehavior: (behavior) => set({ behavior }),
  setLoading: (isLoading) => set({ isLoading }),
}));
