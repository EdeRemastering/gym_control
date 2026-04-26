"use client";

import { useEffect, useMemo, useState } from "react";
import { subHours } from "date-fns";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { ApiError } from "@/lib/api/client";
import {
  useAssignRolePermission,
  useCreatePermission,
  useCreateRbacRole,
  useCreateUser,
  useRemoveRolePermission,
  useUpdateUser,
} from "@/hooks/use-zudel-mutations";
import { usePermissions, useRbacRoles, useRolePermissions, useUsers } from "@/hooks/use-zudel-query";
import { getPermissionUxLabel, getScopeUxLabel } from "@/lib/permission-label.mapper";
import { UX_TOAST } from "@/lib/ux-copy-dictionary";
import { filterUsers, getUsersStats } from "@/modules/users/selectors/users-management.selectors";
import { useAuditStore } from "@/modules/users/store/use-audit-store";
import { useUsersStore } from "@/modules/users/store/use-users-store";
import type { CreateRoleForm, CreateUserForm } from "@/modules/users/schemas/users-management.schema";
import type { CreatePermissionForm } from "@/modules/users/schemas/users-management.schema";
import type {
  PermissionCatalogItem,
  RoleDefinition,
  UserListItem,
} from "@/modules/users/types/users-management.types";

const BRANCHES = ["Sede Centro", "Sede Norte", "Sede Sur"];
const STATUS_SEQ: UserListItem["status"][] = ["active", "active", "inactive", "pending", "blocked"];

function mapUser(user: { id: string; name: string; email: string; role?: "ADMIN" | "TRAINER" | "CLIENT"; createdAt?: string }, index: number): UserListItem {
  return {
    ...user,
    phone: null,
    bio: null,
    status: STATUS_SEQ[index % STATUS_SEQ.length],
    branch: BRANCHES[index % BRANCHES.length],
    lastAccessAt: subHours(new Date(), (index + 1) * 3).toISOString(),
    specialPermissions: index % 2 === 0 ? ["alerts", "reports"] : ["dashboard", "clients"],
  };
}

export function useUsersManagementModule() {
  const usersQuery = useUsers();
  const rbacRolesQuery = useRbacRoles();
  const permissionsQuery = usePermissions();
  const createUser = useCreateUser();
  const createRbacRole = useCreateRbacRole();
  const createPermission = useCreatePermission();
  const updateUser = useUpdateUser();
  const assignRolePermission = useAssignRolePermission();
  const removeRolePermission = useRemoveRolePermission();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const rolePermissionsQuery = useRolePermissions(selectedRoleId || undefined);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isCreatePermissionOpen, setIsCreatePermissionOpen] = useState(false);
  const { filters, activeTab, selectedIds, editingUser, assignRoleUser, setFilters, setActiveTab, toggleSelect, clearSelection, setEditingUser, setAssignRoleUser, resetFilters } =
    useUsersStore(
      useShallow((state) => ({
        filters: state.filters,
        activeTab: state.activeTab,
        selectedIds: state.selectedIds,
        editingUser: state.editingUser,
        assignRoleUser: state.assignRoleUser,
        setFilters: state.setFilters,
        setActiveTab: state.setActiveTab,
        toggleSelect: state.toggleSelect,
        clearSelection: state.clearSelection,
        setEditingUser: state.setEditingUser,
        setAssignRoleUser: state.setAssignRoleUser,
        resetFilters: state.resetFilters,
      })),
    );
  const { items: auditItems, pushItem } = useAuditStore(
    useShallow((state) => ({ items: state.items, pushItem: state.pushItem })),
  );

  const roles = useMemo<RoleDefinition[]>(() => {
    const assignedIds = new Set((rolePermissionsQuery.data ?? []).map((item) => item.permissionId));
    return (rbacRolesQuery.data ?? []).map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description ?? "Rol del sistema",
      userCount: 0,
      color: "text-cyan-300",
      permissions: role.id === selectedRoleId ? Array.from(assignedIds) : [],
    }));
  }, [rbacRolesQuery.data, rolePermissionsQuery.data, selectedRoleId]);

  const permissionCatalog = useMemo<PermissionCatalogItem[]>(
    () =>
      (permissionsQuery.data ?? []).map((permission) => ({
        id: permission.id,
        key: `${permission.resource}:${permission.action}`,
        label: getPermissionUxLabel(permission.resource, permission.action),
        scope: getScopeUxLabel(permission.scope),
      })),
    [permissionsQuery.data],
  );

  useEffect(() => {
    if (!selectedRoleId && roles.length) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const mappedUsers = useMemo(() => (usersQuery.data ?? []).map((item, index) => mapUser(item, index)), [usersQuery.data]);
  const tabFiltered = useMemo(
    () => (activeTab === "all" ? mappedUsers : mappedUsers.filter((user) => user.status === activeTab)),
    [activeTab, mappedUsers],
  );
  const users = useMemo(() => filterUsers(tabFiltered, filters), [tabFiltered, filters]);
  const stats = useMemo(() => getUsersStats(mappedUsers, roles.length), [mappedUsers, roles.length]);
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0];
  const branchOptions = useMemo(() => Array.from(new Set(mappedUsers.map((user) => user.branch))), [mappedUsers]);

  const activity = useMemo(() => {
    if (auditItems.length) return auditItems;
    return [
      { id: "a1", action: "Nuevo usuario creado: Asistente Sur", actor: "Sistema", timestamp: subHours(new Date(), 1).toISOString() },
      { id: "a2", action: "Rol actualizado: Entrenador", actor: "Admin", timestamp: subHours(new Date(), 3).toISOString() },
      { id: "a3", action: "Permisos modificados: Finanzas", actor: "Admin", timestamp: subHours(new Date(), 5).toISOString() },
    ];
  }, [auditItems]);

  async function createUserFromModal(data: CreateUserForm) {
    await createUser.mutateAsync({ name: data.name, email: data.email, phone: data.phone, bio: `Sede: ${data.branch}` });
    pushItem({
      id: `audit-${Date.now()}`,
      action: `Usuario creado: ${data.name}`,
      actor: "Admin",
      timestamp: new Date().toISOString(),
    });
  }

  async function saveUserEdit(data: { userId: string; name: string }) {
    await updateUser.mutateAsync({ userId: data.userId, data: { name: data.name } });
    pushItem({
      id: `audit-${Date.now()}`,
      action: `Usuario editado: ${data.name}`,
      actor: "Admin",
      timestamp: new Date().toISOString(),
    });
  }

  function assignRole(data: { userId: string; roleName: string }) {
    pushItem({
      id: `audit-${Date.now()}`,
      action: `Rol asignado (${data.roleName}) a usuario ${data.userId}`,
      actor: "Admin",
      timestamp: new Date().toISOString(),
    });
  }

  async function createRole(data: CreateRoleForm) {
    try {
      const created = await createRbacRole.mutateAsync({
        name: data.name.trim(),
        description: data.description.trim(),
      });
      await rbacRolesQuery.refetch();
      setSelectedRoleId(created.id);
      setIsCreateRoleOpen(false);
      toast.success(UX_TOAST.roleCreated);
    } catch (error) {
      if (error instanceof ApiError && error.details) {
        toast.error(UX_TOAST.roleCreateError, { description: error.details });
        return;
      }
      toast.error(UX_TOAST.roleCreateError);
    }
  }

  async function createPermissionFromModal(data: CreatePermissionForm) {
    try {
      await createPermission.mutateAsync({
        name: data.name.trim(),
        resource: data.resource.trim(),
        action: data.action.trim(),
        scope: data.scope,
      });
      await permissionsQuery.refetch();
      setIsCreatePermissionOpen(false);
      toast.success(UX_TOAST.permissionCreated);
    } catch (error) {
      if (error instanceof ApiError && error.details) {
        toast.error(UX_TOAST.permissionCreateError, { description: error.details });
        return;
      }
      toast.error(UX_TOAST.permissionCreateError);
    }
  }

  async function toggleRolePermission(permissionId: string, enabled: boolean) {
    if (!selectedRole?.id) return;
    try {
      if (enabled) {
        await removeRolePermission.mutateAsync({ roleId: selectedRole.id, permissionId });
        toast.success(UX_TOAST.permissionDisabled);
      } else {
        await assignRolePermission.mutateAsync({ roleId: selectedRole.id, permissionId });
        toast.success(UX_TOAST.permissionEnabled);
      }
      await rolePermissionsQuery.refetch();
    } catch {
      toast.error(UX_TOAST.permissionUpdateError);
    }
  }

  return {
    users,
    stats,
    filters,
    activeTab,
    selectedIds,
    branchOptions,
    roles,
    selectedRole,
    permissionCatalog,
    activity,
    editingUser,
    assignRoleUser,
    isCreateRoleOpen,
    isCreatePermissionOpen,
    isUpdatingPermissions: assignRolePermission.isPending || removeRolePermission.isPending,
    isLoading: usersQuery.isLoading,
    setFilters,
    setActiveTab,
    toggleSelect,
    clearSelection,
    setEditingUser,
    setAssignRoleUser,
    resetFilters,
    selectRole: setSelectedRoleId,
    openCreateRole: setIsCreateRoleOpen,
    openCreatePermission: setIsCreatePermissionOpen,
    createUserFromModal,
    saveUserEdit,
    assignRole,
    createRole,
    createPermission: createPermissionFromModal,
    toggleRolePermission,
  };
}
