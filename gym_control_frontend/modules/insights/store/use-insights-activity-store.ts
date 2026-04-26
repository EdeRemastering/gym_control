"use client";

import { create } from "zustand";
import type { AnalyticsEventItem } from "@/modules/insights/types/insights.types";

interface ActivityState {
  events: AnalyticsEventItem[];
  isLoading: boolean;
  prependOptimistic: (event: AnalyticsEventItem) => void;
  setEvents: (events: AnalyticsEventItem[]) => void;
  setLoading: (v: boolean) => void;
}

export const useInsightsActivityStore = create<ActivityState>((set) => ({
  events: [],
  isLoading: true,
  prependOptimistic: (event) => set((s) => ({ events: [event, ...s.events] })),
  setEvents: (events) => set({ events }),
  setLoading: (isLoading) => set({ isLoading }),
}));
