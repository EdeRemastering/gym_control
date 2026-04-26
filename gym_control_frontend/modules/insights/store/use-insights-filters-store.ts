"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { InsightsDatePreset, PlanSegmentFilter } from "@/modules/insights/types/insights.types";

interface InsightsFiltersState {
  datePreset: InsightsDatePreset;
  branchId: string;
  planSegment: PlanSegmentFilter;
  lastAppliedAt: number | null;
  setDatePreset: (v: InsightsDatePreset) => void;
  setBranchId: (v: string) => void;
  setPlanSegment: (v: PlanSegmentFilter) => void;
  markApplied: () => void;
}

export const useInsightsFiltersStore = create<InsightsFiltersState>()(
  persist(
    (set) => ({
      datePreset: "7d",
      branchId: "all",
      planSegment: "all",
      lastAppliedAt: null,
      setDatePreset: (datePreset) => set({ datePreset }),
      setBranchId: (branchId) => set({ branchId }),
      setPlanSegment: (planSegment) => set({ planSegment }),
      markApplied: () => set({ lastAppliedAt: Date.now() }),
    }),
    { name: "gc-insights-filters-v1" },
  ),
);
