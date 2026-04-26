"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { UserListItem } from "@/modules/users/types/users-management.types";

interface UserActionsDropdownProps {
  user: UserListItem;
  onEdit: () => void;
  onAssignRole: () => void;
}

export function UserActionsDropdown({ user, onEdit, onAssignRole }: UserActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
        <DropdownMenuItem onClick={onAssignRole}>Asignar rol</DropdownMenuItem>
        <DropdownMenuItem>Resetear acceso</DropdownMenuItem>
        <DropdownMenuItem>Enviar invitación</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-rose-300 focus:bg-rose-500/15">Bloquear usuario</DropdownMenuItem>
        <DropdownMenuItem className="text-rose-300 focus:bg-rose-500/15">Eliminar usuario</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Historial de {user.name}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
