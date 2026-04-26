import { subDays } from "date-fns";
import type { UsersFilters, UserListItem, UsersStats } from "@/modules/users/types/users-management.types";

export function filterUsers(items: UserListItem[], filters: UsersFilters): UserListItem[] {
  const now = new Date();
  return items.filter((item) => {
    const lastAccess = new Date(item.lastAccessAt);
    const matchesInactivity =
      filters.inactivity === "all" ||
      (filters.inactivity === "inactive_7d" && lastAccess < subDays(now, 7)) ||
      (filters.inactivity === "inactive_30d" && lastAccess < subDays(now, 30));

    const searchBlob = `${item.name ?? ""} ${item.email ?? ""} ${item.branch}`.toLowerCase();

    return (
      (filters.role === "all" || item.role === filters.role) &&
      (filters.branch === "all" || item.branch === filters.branch) &&
      (filters.status === "all" || item.status === filters.status) &&
      matchesInactivity &&
      (filters.search.trim().length === 0 || searchBlob.includes(filters.search.toLowerCase()))
    );
  });
}

export function getUsersStats(users: UserListItem[], rolesCount: number): UsersStats {
  const permissions = new Set(users.flatMap((user) => user.specialPermissions));
  return {
    total: users.length,
    active: users.filter((user) => user.status === "active").length,
    roles: rolesCount,
    permissions: permissions.size,
    invitations: users.filter((user) => user.status === "pending").length,
    blocked: users.filter((user) => user.status === "blocked").length,
  };
}
