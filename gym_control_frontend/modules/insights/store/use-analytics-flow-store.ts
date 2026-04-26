"use client";

import { create } from "zustand";
import type { FlowSeriesPoint, SegmentSlice } from "@/modules/insights/types/insights.types";

interface AnalyticsFlowState {
  series: FlowSeriesPoint[];
  segments: SegmentSlice[];
  highlightIndex: number | null;
  isLoading: boolean;
  setSeries: (series: FlowSeriesPoint[]) => void;
  setSegments: (segments: SegmentSlice[]) => void;
  setHighlightIndex: (i: number | null) => void;
  setLoading: (v: boolean) => void;
}

export const useAnalyticsFlowStore = create<AnalyticsFlowState>((set) => ({
  series: [],
  segments: [],
  highlightIndex: null,
  isLoading: true,
  setSeries: (series) => set({ series }),
  setSegments: (segments) => set({ segments }),
  setHighlightIndex: (highlightIndex) => set({ highlightIndex }),
  setLoading: (isLoading) => set({ isLoading }),
}));
