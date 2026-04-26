"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssignRolePermission, useRemoveRolePermission } from "@/hooks/use-zudel-mutations";
import { usePermissions, useRbacRoles, useRolePermissions } from "@/hooks/use-zudel-query";
import { getPermissionUxLabel, getScopeUxLabel } from "@/lib/permission-label.mapper";
import { toast } from "sonner";

export function RbacAdminPanel() {
  const queryClient = useQueryClient();
  const permissionsQuery = usePermissions();
  const rolesQuery = useRbacRoles();
  const assignRolePermission = useAssignRolePermission();
  const removeRolePermission = useRemoveRolePermission();
  const [roleId, setRoleId] = useState("");
  const [search, setSearch] = useState("");
  const [showAssignedOnly, setShowAssignedOnly] = useState(false);
  const rolePermissionsQuery = useRolePermissions(roleId || undefined);

  const assignedPermissionIds = useMemo(
    () => new Set((rolePermissionsQuery.data ?? []).map((item) => item.permissionId)),
    [rolePermissionsQuery.data],
  );

  const permissions = useMemo(() => {
    const rows = permissionsQuery.data ?? [];
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (showAssignedOnly && !assignedPermissionIds.has(row.id)) return false;
      if (!term) return true;
      const uxLabel = getPermissionUxLabel(row.resource, row.action);
      const uxScope = getScopeUxLabel(row.scope);
      return `${uxLabel}:${uxScope}:${row.resource}:${row.action}:${row.scope}:${row.name}`.toLowerCase().includes(term);
    });
  }, [permissionsQuery.data, search, showAssignedOnly, assignedPermissionIds]);

  const disabled = !roleId.trim();

  return (
    <Card className="space-y-3 border-white/10 bg-white/5">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-white">Gestion de accesos</p>
        <p className="text-xs text-[var(--muted)]">
          Define que acciones puede realizar cada perfil en el sistema.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            {(rolesQuery.data ?? []).map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar accion o area..."
          className="h-10 rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] px-3 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-2 py-1.5">
        <p className="text-xs text-[var(--muted)]">
          Permisos asignados al rol: {assignedPermissionIds.size}
        </p>
        <Button
          size="sm"
          variant={showAssignedOnly ? "default" : "ghost"}
          className="h-7 text-[11px]"
          onClick={() => setShowAssignedOnly((prev) => !prev)}
          disabled={disabled}
        >
          {showAssignedOnly ? "Ver todos" : "Solo asignados"}
        </Button>
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-2">
        {permissions.map((permission) => (
          <div
            key={permission.id}
            className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-2 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">
                {getPermissionUxLabel(permission.resource, permission.action)}
              </p>
              <p className="truncate text-[11px] text-[var(--muted)]">
                {getScopeUxLabel(permission.scope)}
              </p>
              {assignedPermissionIds.has(permission.id) ? (
                <p className="text-[10px] font-medium text-emerald-300">Asignado</p>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                disabled={disabled || assignRolePermission.isPending}
                onClick={() =>
                  assignRolePermission.mutate(
                    {
                      roleId: roleId.trim(),
                      permissionId: permission.id,
                    },
                    {
                      onSuccess: async () => {
                        await Promise.all([
                          queryClient.invalidateQueries({ queryKey: ["rolePermissions"] }),
                          queryClient.invalidateQueries({ queryKey: ["permissions"] }),
                          queryClient.invalidateQueries({ queryKey: ["rbacRoles"] }),
                        ]);
                        toast.success("Permiso asignado correctamente");
                      },
                      onError: () => toast.error("No se pudo asignar el permiso"),
                    },
                  )
                }
              >
                Asignar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={disabled || removeRolePermission.isPending}
                onClick={() =>
                  removeRolePermission.mutate(
                    {
                      roleId: roleId.trim(),
                      permissionId: permission.id,
                    },
                    {
                      onSuccess: async () => {
                        await Promise.all([
                          queryClient.invalidateQueries({ queryKey: ["rolePermissions"] }),
                          queryClient.invalidateQueries({ queryKey: ["permissions"] }),
                          queryClient.invalidateQueries({ queryKey: ["rbacRoles"] }),
                        ]);
                        toast.success("Permiso removido correctamente");
                      },
                      onError: () => toast.error("No se pudo remover el permiso"),
                    },
                  )
                }
              >
                Quitar
              </Button>
            </div>
          </div>
        ))}
        {!permissions.length ? (
          <p className="px-1 py-2 text-xs text-[var(--muted)]">Sin permisos para mostrar.</p>
        ) : null}
      </div>
    </Card>
  );
}
