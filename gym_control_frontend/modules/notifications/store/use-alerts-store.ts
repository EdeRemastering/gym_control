"use client";

import { create } from "zustand";
import { DEFAULT_ALERT_FILTERS } from "@/modules/notifications/constants/alerts.constants";
import type { AlertFilters } from "@/modules/notifications/types/alerts.types";

interface AlertsStoreState {
  filters: AlertFilters;
  activeTab: AlertFilters["priority"];
  isCreateDialogOpen: boolean;
  localCreatedAlerts: {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    priority: "critical" | "important" | "informative";
    scope: "payment" | "attendance" | "system" | "training" | "reminder";
    owner: string;
    branch: string;
  }[];
  setFilters: (patch: Partial<AlertFilters>) => void;
  resetFilters: () => void;
  setActiveTab: (tab: AlertFilters["priority"]) => void;
  setCreateDialogOpen: (isOpen: boolean) => void;
  addLocalAlert: (alert: AlertsStoreState["localCreatedAlerts"][number]) => void;
}

export const useAlertsStore = create<AlertsStoreState>((set) => ({
  filters: DEFAULT_ALERT_FILTERS,
  activeTab: "all",
  isCreateDialogOpen: false,
  localCreatedAlerts: [],
  setFilters: (patch) =>
    set((state) => ({
      filters: { ...state.filters, ...patch },
    })),
  resetFilters: () => set({ filters: DEFAULT_ALERT_FILTERS }),
  setActiveTab: (tab) =>
    set((state) => ({
      activeTab: tab,
      filters: { ...state.filters, priority: tab },
    })),
  setCreateDialogOpen: (isOpen) => set({ isCreateDialogOpen: isOpen }),
  addLocalAlert: (alert) =>
    set((state) => ({
      localCreatedAlerts: [alert, ...state.localCreatedAlerts],
    })),
}));
