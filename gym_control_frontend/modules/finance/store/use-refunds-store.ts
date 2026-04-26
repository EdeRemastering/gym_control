"use client";

import { create } from "zustand";

interface RefundsStore {
  pendingApprovalIds: string[];
  queueRefund: (paymentId: string) => void;
  clearRefund: (paymentId: string) => void;
}

export const useRefundsStore = create<RefundsStore>((set) => ({
  pendingApprovalIds: [],
  queueRefund: (id) => set((s) => ({ pendingApprovalIds: [...s.pendingApprovalIds, id] })),
  clearRefund: (id) =>
    set((s) => ({ pendingApprovalIds: s.pendingApprovalIds.filter((x) => x !== id) })),
}));
