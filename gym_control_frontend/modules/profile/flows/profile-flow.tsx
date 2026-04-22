"use client";

import { Card } from "@/components/ui/card";
import { useSessionStore } from "@/lib/session-store";

export function ProfileFlow() {
  const user = useSessionStore((state) => state.user);
  return (
    <Card>
      <p className="text-sm text-[var(--muted)]">Profile Flow</p>
      <p className="mt-2 text-sm text-white">
        Usuario autenticado: {user?.name ?? "Sin sesión"}.
      </p>
    </Card>
  );
}
