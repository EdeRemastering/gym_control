"use client";

import { create } from "zustand";

interface InsightsUiState {
  createInsightOpen: boolean;
  setCreateInsightOpen: (v: boolean) => void;
}

export const useInsightsUiStore = create<InsightsUiState>((set) => ({
  createInsightOpen: false,
  setCreateInsightOpen: (createInsightOpen) => set({ createInsightOpen }),
}));
