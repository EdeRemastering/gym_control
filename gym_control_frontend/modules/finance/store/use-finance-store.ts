"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_FINANCE_FILTERS } from "@/modules/finance/constants/finance.constants";
import type { FinanceFilters } from "@/modules/finance/types/finance.types";

interface FinanceStore {
  filters: FinanceFilters;
  createPlanOpen: boolean;
  editPlanOpen: boolean;
  registerPaymentOpen: boolean;
  setFilters: (patch: Partial<FinanceFilters>) => void;
  setCreatePlanOpen: (open: boolean) => void;
  setEditPlanOpen: (open: boolean) => void;
  setRegisterPaymentOpen: (open: boolean) => void;
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      filters: DEFAULT_FINANCE_FILTERS,
      createPlanOpen: false,
      editPlanOpen: false,
      registerPaymentOpen: false,
      setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
      setCreatePlanOpen: (open) => set({ createPlanOpen: open }),
      setEditPlanOpen: (open) => set({ editPlanOpen: open }),
      setRegisterPaymentOpen: (open) => set({ registerPaymentOpen: open }),
    }),
    { name: "gym-finance-filters", partialize: (s) => ({ filters: s.filters }) },
  ),
);
