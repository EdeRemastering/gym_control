"use client";

import { create } from "zustand";
import { DEFAULT_USERS_FILTERS } from "@/modules/users/constants/users-management.constants";
import type { UserListItem, UsersFilters } from "@/modules/users/types/users-management.types";

interface UsersStoreState {
  filters: UsersFilters;
  activeTab: "all" | "active" | "inactive" | "blocked" | "pending";
  selectedIds: string[];
  editingUser: UserListItem | null;
  assignRoleUser: UserListItem | null;
  setFilters: (patch: Partial<UsersFilters>) => void;
  setActiveTab: (tab: UsersStoreState["activeTab"]) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  setEditingUser: (user: UserListItem | null) => void;
  setAssignRoleUser: (user: UserListItem | null) => void;
  resetFilters: () => void;
}

export const useUsersStore = create<UsersStoreState>((set) => ({
  filters: DEFAULT_USERS_FILTERS,
  activeTab: "all",
  selectedIds: [],
  editingUser: null,
  assignRoleUser: null,
  setFilters: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((currentId) => currentId !== id)
        : [...state.selectedIds, id],
    })),
  clearSelection: () => set({ selectedIds: [] }),
  setEditingUser: (user) => set({ editingUser: user }),
  setAssignRoleUser: (user) => set({ assignRoleUser: user }),
  resetFilters: () => set({ filters: DEFAULT_USERS_FILTERS }),
}));
