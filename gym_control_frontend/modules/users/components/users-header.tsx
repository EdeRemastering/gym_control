"use client";

import { Button } from "@/components/ui/button";
import { UsersSearchBar } from "@/modules/users/components/users-search-bar";

interface UsersHeaderProps {
  search: string;
  onSearch: (value: string) => void;
  onCreateUser: () => void;
}

export function UsersHeader({ search, onSearch, onCreateUser }: UsersHeaderProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(6,14,31,0.96),rgba(4,10,22,0.96))] p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Usuarios y roles</p>
        <h2 className="text-xl font-semibold text-white">Gestión de usuarios, roles y permisos</h2>
      </div>
      <div className="flex items-center gap-2">
        <UsersSearchBar value={search} onChange={onSearch} />
        <Button size="sm" variant="primary" onClick={onCreateUser}>
          Crear usuario
        </Button>
      </div>
    </div>
  );
}
