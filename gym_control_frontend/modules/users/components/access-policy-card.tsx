"use client";

import { Card } from "@/components/ui/card";

export function AccessPolicyCard() {
  return (
    <Card className="space-y-1.5 border-white/10 bg-[linear-gradient(180deg,rgba(35,17,68,0.45),rgba(6,14,32,0.9))]">
      <p className="text-sm font-semibold text-white">Política de acceso</p>
      <p className="text-xs text-[var(--muted)]">
        MFA obligatoria para administradores, expiración de sesión a 12h y revocación automática ante accesos sospechosos.
      </p>
    </Card>
  );
}
