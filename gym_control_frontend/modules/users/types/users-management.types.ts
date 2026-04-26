import type { Role, User } from "@/lib/types";

export type UserStatus = "active" | "inactive" | "blocked" | "pending";

export type PermissionKey =
  string;

export interface PermissionCatalogItem {
  id: string;
  key: PermissionKey;
  label: string;
  scope: string;
}

export interface UserListItem extends User {
  status: UserStatus;
  branch: string;
  lastAccessAt: string;
  specialPermissions: PermissionKey[];
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  userCount: number;
  color: string;
  permissions: PermissionKey[];
}

export interface AuditItem {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
}

export interface UsersFilters {
  role: "all" | Role;
  branch: "all" | string;
  status: "all" | UserStatus;
  inactivity: "all" | "inactive_7d" | "inactive_30d";
  search: string;
}

export interface UsersStats {
  total: number;
  active: number;
  roles: number;
  permissions: number;
  invitations: number;
  blocked: number;
}
