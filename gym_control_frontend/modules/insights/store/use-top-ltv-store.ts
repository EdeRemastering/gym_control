"use client";

import { create } from "zustand";
import type { TopLtvClient } from "@/modules/insights/types/insights.types";

interface TopLtvState {
  clients: TopLtvClient[];
  isLoading: boolean;
  setClients: (clients: TopLtvClient[]) => void;
  setLoading: (v: boolean) => void;
}

export const useTopLtvStore = create<TopLtvState>((set) => ({
  clients: [],
  isLoading: true,
  setClients: (clients) => set({ clients }),
  setLoading: (isLoading) => set({ isLoading }),
}));
