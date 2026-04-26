"use client";

import { create } from "zustand";
import type { PermissionKey } from "@/modules/users/types/users-management.types";

interface PermissionsStoreState {
  permissionCatalog: PermissionKey[];
}

export const usePermissionsStore = create<PermissionsStoreState>(() => ({
  permissionCatalog: ["dashboard", "clients", "memberships", "finance", "reports", "alerts", "scheduling", "training", "users", "settings"],
}));
