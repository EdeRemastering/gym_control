"use client";

import { Card } from "@/components/ui/card";
import { useAuth } from "@/modules/auth/hooks/use-auth";

export function AuthFlow() {
  const auth = useAuth();
  return (
    <Card>
      <p className="text-sm text-[var(--muted)]">Auth Flow</p>
      <p className="mt-2 text-sm text-white">
        {auth.isAuthenticated ? `Sesión activa para ${auth.user?.name}` : "Sin sesión activa"}
      </p>
    </Card>
  );
}
