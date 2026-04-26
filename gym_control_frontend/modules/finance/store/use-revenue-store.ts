"use client";

import { create } from "zustand";

export type RevenueChartMode = "daily" | "monthly";

interface RevenueStore {
  chartMode: RevenueChartMode;
  setChartMode: (mode: RevenueChartMode) => void;
}

export const useRevenueStore = create<RevenueStore>((set) => ({
  chartMode: "monthly",
  setChartMode: (mode) => set({ chartMode: mode }),
}));
