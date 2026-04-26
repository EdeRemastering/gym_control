"use client";

import { create } from "zustand";
import type { AiInsightItem } from "@/modules/insights/types/insights.types";

interface AiRecommendationsState {
  items: AiInsightItem[];
  dismissedIds: string[];
  isLoading: boolean;
  setItems: (items: AiInsightItem[]) => void;
  dismiss: (id: string) => void;
  restoreDismissed: () => void;
  setLoading: (v: boolean) => void;
}

export const useAiRecommendationsStore = create<AiRecommendationsState>((set) => ({
  items: [],
  dismissedIds: [],
  isLoading: true,
  setItems: (items) => set({ items }),
  dismiss: (id) =>
    set((s) => ({
      dismissedIds: s.dismissedIds.includes(id) ? s.dismissedIds : [...s.dismissedIds, id],
    })),
  restoreDismissed: () => set({ dismissedIds: [] }),
  setLoading: (isLoading) => set({ isLoading }),
}));
