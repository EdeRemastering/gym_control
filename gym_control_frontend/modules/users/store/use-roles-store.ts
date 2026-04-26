"use client";

import { create } from "zustand";
import { SYSTEM_ROLES } from "@/modules/users/constants/users-management.constants";
import type { RoleDefinition } from "@/modules/users/types/users-management.types";

interface RolesStoreState {
  roles: RoleDefinition[];
  selectedRoleId: string;
  isCreateRoleOpen: boolean;
  selectRole: (roleId: string) => void;
  openCreateRole: (open: boolean) => void;
  addRole: (role: RoleDefinition) => void;
}

export const useRolesStore = create<RolesStoreState>((set) => ({
  roles: SYSTEM_ROLES,
  selectedRoleId: SYSTEM_ROLES[0]?.id ?? "",
  isCreateRoleOpen: false,
  selectRole: (roleId) => set({ selectedRoleId: roleId }),
  openCreateRole: (open) => set({ isCreateRoleOpen: open }),
  addRole: (role) => set((state) => ({ roles: [role, ...state.roles] })),
}));
