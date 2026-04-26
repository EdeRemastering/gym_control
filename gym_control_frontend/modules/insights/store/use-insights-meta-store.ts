"use client";

import { create } from "zustand";

interface InsightsMetaState {
  /** última hidratación exitosa */
  hydratedAt: number | null;
  cacheKey: string;
  setHydrated: (at: number, cacheKey: string) => void;
}

export const useInsightsMetaStore = create<InsightsMetaState>((set) => ({
  hydratedAt: null,
  cacheKey: "",
  setHydrated: (hydratedAt, cacheKey) => set({ hydratedAt, cacheKey }),
}));
