"use client";

import { UserMobileCard, UserRowCard } from "@/modules/users/components/user-row-card";
import { ResponsiveDataView } from "@/components/responsive-data-view";
import type { UserListItem } from "@/modules/users/types/users-management.types";

interface UsersTableProps {
  users: UserListItem[];
  selectedIds: string[];
  isLoading: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (user: UserListItem) => void;
  onAssignRole: (user: UserListItem) => void;
}

export function UsersTable({ users, selectedIds, isLoading, onToggleSelect, onEdit, onAssignRole }: UsersTableProps) {
  if (isLoading) return <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">Cargando usuarios...</div>;
  if (!users.length) return <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-[var(--muted)]">No hay usuarios para estos filtros.</div>;
  return (
    <ResponsiveDataView
      mobile={
        <section className="space-y-2">
          {users.map((user) => (
            <UserMobileCard
              key={`mobile-${user.id}`}
              user={user}
              checked={selectedIds.includes(user.id)}
              onToggle={() => onToggleSelect(user.id)}
              onEdit={() => onEdit(user)}
              onAssignRole={() => onAssignRole(user)}
            />
          ))}
        </section>
      }
      desktop={
        <section className="overflow-x-auto rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,34,0.95),rgba(5,10,25,0.97))]">
          <div className="grid min-w-[760px] grid-cols-[28px_minmax(210px,1fr)_130px_130px_130px_130px_70px] gap-2 border-b border-white/10 px-3 py-2 text-[11px] uppercase tracking-wide text-[var(--muted)]">
            <span />
            <span>Usuario</span>
            <span>Rol</span>
            <span>Sede</span>
            <span>Estado</span>
            <span>Último acceso</span>
            <span>Acciones</span>
          </div>
          {users.map((user) => (
            <UserRowCard
              key={user.id}
              user={user}
              checked={selectedIds.includes(user.id)}
              onToggle={() => onToggleSelect(user.id)}
              onEdit={() => onEdit(user)}
              onAssignRole={() => onAssignRole(user)}
            />
          ))}
        </section>
      }
    />
  );
}
