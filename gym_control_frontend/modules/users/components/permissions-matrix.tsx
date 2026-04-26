"use client";

import type {
  PermissionCatalogItem,
  RoleDefinition,
} from "@/modules/users/types/users-management.types";

export function PermissionsMatrix({
  role,
  catalog,
  onTogglePermission,
  isUpdating,
}: {
  role?: RoleDefinition;
  catalog: PermissionCatalogItem[];
  onTogglePermission: (permissionId: string, enabled: boolean) => void;
  isUpdating?: boolean;
}) {
  return (
    <div className="space-y-1.5 rounded-lg border border-white/10 bg-black/20 p-2.5">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Matriz de permisos</p>
      <div className="grid grid-cols-2 gap-1.5">
        {catalog.map((permission) => {
          const enabled = role?.permissions.includes(permission.id) ?? false;
          return (
            <button
              key={permission.id}
              type="button"
              disabled={!role?.id || isUpdating}
              onClick={() => onTogglePermission(permission.id, enabled)}
              className={`rounded-md px-2 py-1 text-left text-xs transition ${
                enabled
                  ? "bg-emerald-500/15 text-emerald-200"
                  : "bg-white/5 text-[var(--muted)] hover:bg-white/10"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {permission.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
