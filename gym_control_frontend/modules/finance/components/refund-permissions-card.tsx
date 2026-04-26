"use client";

import { Lock, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Role } from "@/lib/types";

const rows = [
  { action: "Reembolsos totales", roles: "Solo admins" },
  { action: "Ajustes manuales", roles: "Admins + Finanzas" },
  { action: "Descuentos especiales", roles: "Admins + Finanzas" },
  { action: "Cancelaciones avanzadas", roles: "Solo admins" },
];

export function RefundPermissionsCard({ role }: { role: Role }) {
  const canExecute = role === "ADMIN";
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(20,10,40,0.5),rgba(6,14,32,0.92))]">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-fuchsia-300" />
        <p className="text-sm font-semibold text-white">Permisos financieros</p>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">
        {canExecute
          ? "Tu rol puede ejecutar operaciones sensibles según política."
          : "Vista restringida: solicita aprobación a un administrador."}
      </p>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li
            key={row.action}
            className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 text-xs"
          >
            <span className="flex items-center gap-1.5 text-white/90">
              <Lock className="h-3 w-3 text-[var(--muted)]" />
              {row.action}
            </span>
            <span className="text-[10px] text-cyan-200/90">{row.roles}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
