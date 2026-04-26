"use client";

import { Search } from "lucide-react";

interface UsersSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function UsersSearchBar({ value, onChange }: UsersSearchBarProps) {
  return (
    <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 md:w-[240px]">
      <Search className="h-4 w-4 text-[var(--muted)]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar cliente por nombre..."
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[var(--muted)]"
      />
    </label>
  );
}
