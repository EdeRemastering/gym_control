import type { Role } from "@/lib/types";

export function RolePill({ role }: { role: Role }) {
  return (
    <span className="rounded-full border border-[var(--border)] bg-white/5 px-2 py-1 text-xs text-white">
      {role}
    </span>
  );
}
