"use client";

import { Download, FileText, PlusCircle, ShieldCheck, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";

export function QuickActionsPanel({ onCreateUser, onCreateRole }: { onCreateUser: () => void; onCreateRole: () => void }) {
  const actions = [
    { label: "Crear usuario", icon: PlusCircle, run: onCreateUser },
    { label: "Crear rol", icon: ShieldCheck, run: onCreateRole },
    { label: "Importar usuarios", icon: Upload, run: onCreateUser },
    { label: "Exportar permisos", icon: Download, run: onCreateRole },
    { label: "Generar auditoría", icon: FileText, run: onCreateRole },
  ];
  return (
    <Card className="space-y-2 border-white/10 bg-white/5">
      <p className="text-sm font-semibold text-white">Acciones rápidas</p>
      {actions.map((action) => (
        <button key={action.label} type="button" onClick={action.run} className="flex w-full items-center gap-2 rounded-lg border border-transparent bg-white/5 px-2.5 py-2 text-left text-sm text-white transition hover:border-white/20 hover:bg-white/10">
          <action.icon className="h-4 w-4 text-cyan-300" />
          {action.label}
        </button>
      ))}
    </Card>
  );
}
