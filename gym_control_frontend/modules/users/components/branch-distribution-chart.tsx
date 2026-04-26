"use client";

import { Card } from "@/components/ui/card";
import type { UserListItem } from "@/modules/users/types/users-management.types";

export function BranchDistributionChart({ users }: { users: UserListItem[] }) {
  const byBranch = users.reduce<Record<string, number>>((acc, user) => {
    acc[user.branch] = (acc[user.branch] ?? 0) + 1;
    return acc;
  }, {});
  return (
    <Card className="space-y-2 border-white/10 bg-white/5">
      <p className="text-sm font-semibold text-white">Usuarios por sede</p>
      {Object.entries(byBranch).map(([branch, count]) => (
        <div key={branch} className="flex items-center justify-between text-xs text-[var(--muted)]">
          <span>{branch}</span>
          <span className="text-white">{count}</span>
        </div>
      ))}
    </Card>
  );
}
