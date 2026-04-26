"use client";

import { create } from "zustand";
import type { Plan } from "@/lib/types";

interface PlansStore {
  editingPlan: Plan | null;
  setEditingPlan: (plan: Plan | null) => void;
}

export const usePlansStore = create<PlansStore>((set) => ({
  editingPlan: null,
  setEditingPlan: (plan) => set({ editingPlan: plan }),
}));
