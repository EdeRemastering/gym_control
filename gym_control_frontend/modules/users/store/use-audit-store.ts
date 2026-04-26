"use client";

import { create } from "zustand";
import type { AuditItem } from "@/modules/users/types/users-management.types";

interface AuditStoreState {
  items: AuditItem[];
  pushItem: (item: AuditItem) => void;
}

export const useAuditStore = create<AuditStoreState>((set) => ({
  items: [],
  pushItem: (item) => set((state) => ({ items: [item, ...state.items].slice(0, 20) })),
}));
