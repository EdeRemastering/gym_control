"use client";

import { create } from "zustand";
import type { BranchForecast, PredictionMetric } from "@/modules/insights/types/insights.types";

interface PredictionsState {
  metrics: PredictionMetric[];
  branchForecasts: BranchForecast[];
  isLoading: boolean;
  setMetrics: (metrics: PredictionMetric[]) => void;
  setBranchForecasts: (rows: BranchForecast[]) => void;
  setLoading: (v: boolean) => void;
}

export const usePredictionsStore = create<PredictionsState>((set) => ({
  metrics: [],
  branchForecasts: [],
  isLoading: true,
  setMetrics: (metrics) => set({ metrics }),
  setBranchForecasts: (branchForecasts) => set({ branchForecasts }),
  setLoading: (isLoading) => set({ isLoading }),
}));
