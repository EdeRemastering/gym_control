"use client";

import { create } from "zustand";
import type { ReportItemState } from "@/modules/insights/types/insights.types";

interface ReportsCenterState {
  reports: ReportItemState[];
  isLoading: boolean;
  setReports: (reports: ReportItemState[]) => void;
  setGenerating: (id: string, isGenerating: boolean) => void;
  markDownloaded: (id: string, at: string) => void;
  setLoading: (v: boolean) => void;
}

export const useReportsCenterStore = create<ReportsCenterState>((set) => ({
  reports: [],
  isLoading: true,
  setReports: (reports) => set({ reports }),
  setGenerating: (id, isGenerating) =>
    set((s) => ({
      reports: s.reports.map((r) => (r.id === id ? { ...r, isGenerating } : r)),
    })),
  markDownloaded: (id, at) =>
    set((s) => ({
      reports: s.reports.map((r) => (r.id === id ? { ...r, lastDownloadedAt: at, isGenerating: false } : r)),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));
