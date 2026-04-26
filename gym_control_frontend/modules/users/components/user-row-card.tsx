"use client";

import { MapPin } from "lucide-react";
import type { UserListItem } from "@/modules/users/types/users-management.types";
import { UserActionsDropdown } from "@/modules/users/components/user-actions-dropdown";

interface UserRowCardProps {
  user: UserListItem;
  checked: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onAssignRole: () => void;
}

export function UserRowCard({ user, checked, onToggle, onEdit, onAssignRole }: UserRowCardProps) {
  return (
    <div className="grid grid-cols-[28px_minmax(210px,1fr)_130px_130px_130px_130px_70px] items-center gap-2 border-b border-white/10 px-3 py-2.5 text-sm text-slate-200 last:border-b-0">
      <input type="checkbox" checked={checked} onChange={onToggle} className="h-4 w-4 accent-cyan-400" />
      <div className="min-w-0">
        <p className="truncate font-medium text-white">{user.name}</p>
        <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
      </div>
      <p className="text-xs">{user.role ?? "N/A"}</p>
      <p className="inline-flex items-center gap-1 text-xs"><MapPin className="h-3.5 w-3.5" />{user.branch}</p>
      <p className="text-xs capitalize">{user.status}</p>
      <p className="text-xs text-[var(--muted)]">{new Date(user.lastAccessAt).toLocaleTimeString()}</p>
      <UserActionsDropdown user={user} onEdit={onEdit} onAssignRole={onAssignRole} />
    </div>
  );
}

export function UserMobileCard({ user, checked, onToggle, onEdit, onAssignRole }: UserRowCardProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
      <div className="flex items-start gap-2">
        <input type="checkbox" checked={checked} onChange={onToggle} className="mt-1 h-4 w-4 accent-cyan-400" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white">{user.name}</p>
          <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
        </div>
        <UserActionsDropdown user={user} onEdit={onEdit} onAssignRole={onAssignRole} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-white/10 bg-black/20 p-2">
          <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">Rol</p>
          <p className="mt-0.5 truncate text-white">{user.role ?? "N/A"}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 p-2">
          <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">Estado</p>
          <p className="mt-0.5 truncate capitalize text-white">{user.status}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 p-2">
          <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">Sede</p>
          <p className="mt-0.5 inline-flex items-center gap-1 truncate text-white">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {user.branch}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 p-2">
          <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">Último acceso</p>
          <p className="mt-0.5 truncate text-white">{new Date(user.lastAccessAt).toLocaleTimeString()}</p>
        </div>
      </div>
    </article>
  );
}
