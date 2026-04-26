"use client";

import type { RoleDefinition } from "@/modules/users/types/users-management.types";

export function RoleCard({ role, active, onClick }: { role: RoleDefinition; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border p-2 text-left transition ${active ? "border-cyan-400/40 bg-cyan-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
    >
      <p className={`text-sm font-medium ${role.color}`}>{role.name}</p>
      <p className="text-xs text-[var(--muted)]">{role.description}</p>
      <p className="mt-1 text-[11px] text-[var(--muted)]">{role.userCount} usuarios</p>
    </button>
  );
}
