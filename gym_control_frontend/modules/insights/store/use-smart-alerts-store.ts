"use client";

import { create } from "zustand";
import type { SmartAlertSummary } from "@/modules/insights/types/insights.types";

interface SmartAlertsState {
  summaries: SmartAlertSummary[];
  isLoading: boolean;
  setSummaries: (rows: SmartAlertSummary[]) => void;
  setLoading: (v: boolean) => void;
}

export const useSmartAlertsStore = create<SmartAlertsState>((set) => ({
  summaries: [],
  isLoading: true,
  setSummaries: (summaries) => set({ summaries }),
  setLoading: (isLoading) => set({ isLoading }),
}));
