"use client";

import { create } from "zustand";
import type { KpiMetric } from "@/modules/insights/types/insights.types";

interface InsightsKpiState {
  kpis: KpiMetric[];
  isLoading: boolean;
  error: string | null;
  setKpis: (kpis: KpiMetric[]) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
}

export const useInsightsKpiStore = create<InsightsKpiState>((set) => ({
  kpis: [],
  isLoading: true,
  error: null,
  setKpis: (kpis) => set({ kpis }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
