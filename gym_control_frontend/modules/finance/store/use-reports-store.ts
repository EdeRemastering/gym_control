"use client";

import { create } from "zustand";

export type ReportKind = "monthly" | "branch" | "churn" | "refunds" | "forecast";

interface ReportsStore {
  lastGenerated: Record<ReportKind, string | null>;
  markGenerated: (kind: ReportKind) => void;
}

export const useReportsStore = create<ReportsStore>((set) => ({
  lastGenerated: {
    monthly: null,
    branch: null,
    churn: null,
    refunds: null,
    forecast: null,
  },
  markGenerated: (kind) =>
    set((s) => ({
      lastGenerated: { ...s.lastGenerated, [kind]: new Date().toISOString() },
    })),
}));
