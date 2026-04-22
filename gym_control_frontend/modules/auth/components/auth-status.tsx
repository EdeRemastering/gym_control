"use client";

import { Card } from "@/components/ui/card";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { AuthBadge } from "@/modules/auth/ui/auth-badge";

export function AuthStatus() {
  const auth = useAuth();
  return (
    <Card>
      <AuthBadge active={auth.isAuthenticated} />
      <p className="mt-2 text-sm text-white">
        {auth.isAuthenticated ? auth.user?.email : "No autenticado"}
      </p>
    </Card>
  );
}
