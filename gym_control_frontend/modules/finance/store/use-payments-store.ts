"use client";

import { create } from "zustand";

interface PaymentsStore {
  hiddenPaymentIds: string[];
  hidePayment: (id: string) => void;
  restorePayment: (id: string) => void;
}

export const usePaymentsStore = create<PaymentsStore>((set) => ({
  hiddenPaymentIds: [],
  hidePayment: (id) => set((s) => ({ hiddenPaymentIds: [...s.hiddenPaymentIds, id] })),
  restorePayment: (id) =>
    set((s) => ({ hiddenPaymentIds: s.hiddenPaymentIds.filter((x) => x !== id) })),
}));
