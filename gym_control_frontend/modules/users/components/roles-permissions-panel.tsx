"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreatePermissionModal } from "@/modules/users/components/create-permission-modal";
import { CreateRoleModal } from "@/modules/users/components/create-role-modal";
import { PermissionsMatrix } from "@/modules/users/components/permissions-matrix";
import { RoleCard } from "@/modules/users/components/role-card";
import type {
  CreatePermissionForm,
  CreateRoleForm,
} from "@/modules/users/schemas/users-management.schema";
import type {
  PermissionCatalogItem,
  RoleDefinition,
} from "@/modules/users/types/users-management.types";

interface RolesPermissionsPanelProps {
  roles: RoleDefinition[];
  selectedRole?: RoleDefinition;
  catalog: PermissionCatalogItem[];
  isCreateOpen: boolean;
  isCreatePermissionOpen: boolean;
  isUpdatingPermissions?: boolean;
  onSelectRole: (id: string) => void;
  onTogglePermission: (permissionId: string, enabled: boolean) => void;
  onOpenCreate: (open: boolean) => void;
  onCreateRole: (data: CreateRoleForm) => void;
  onOpenCreatePermission: (open: boolean) => void;
  onCreatePermission: (data: CreatePermissionForm) => void;
}

export function RolesPermissionsPanel({
  roles,
  selectedRole,
  catalog,
  isCreateOpen,
  isCreatePermissionOpen,
  isUpdatingPermissions,
  onSelectRole,
  onTogglePermission,
  onOpenCreate,
  onCreateRole,
  onOpenCreatePermission,
  onCreatePermission,
}: RolesPermissionsPanelProps) {
  return (
    <Card className="space-y-3 border-white/10 bg-white/5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Roles y permisos</p>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => onOpenCreatePermission(true)}>
            Crear permiso
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onOpenCreate(true)}>
            Crear rol
          </Button>
        </div>
      </div>
      <div className="space-y-1.5">
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} active={role.id === selectedRole?.id} onClick={() => onSelectRole(role.id)} />
        ))}
      </div>
      <PermissionsMatrix
        role={selectedRole}
        catalog={catalog}
        isUpdating={isUpdatingPermissions}
        onTogglePermission={onTogglePermission}
      />
      <CreateRoleModal open={isCreateOpen} onOpenChange={onOpenCreate} onSubmit={onCreateRole} />
      <CreatePermissionModal
        open={isCreatePermissionOpen}
        onOpenChange={onOpenCreatePermission}
        onSubmit={onCreatePermission}
      />
    </Card>
  );
}
