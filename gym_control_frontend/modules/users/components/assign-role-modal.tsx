"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RoleDefinition, UserListItem } from "@/modules/users/types/users-management.types";

interface AssignRoleModalProps {
  user: UserListItem | null;
  roles: RoleDefinition[];
  onClose: () => void;
  onAssign: (data: { userId: string; roleName: string }) => void;
}

export function AssignRoleModal({ user, roles, onClose, onAssign }: AssignRoleModalProps) {
  const [roleName, setRoleName] = useState(roles[0]?.name ?? "Administrador");
  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Asignar rol</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Select value={roleName} onValueChange={setRoleName}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="w-full"
            onClick={() => {
              if (!user) return;
              onAssign({ userId: user.id, roleName });
              onClose();
            }}
          >
            Asignar rol
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
