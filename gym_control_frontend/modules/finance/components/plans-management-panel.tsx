"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PlansManagementPanelProps {
  onCreate: () => void;
}

export function PlansManagementPanel({ onCreate }: PlansManagementPanelProps) {
  return (
    <Card className="border-white/10 bg-white/5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-white">Gestión de planes</p>
        <Button size="sm" variant="primary" className="gap-1" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          Crear plan
        </Button>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Basic, Premium, Enterprise, Corporate, PT PRO — precios, promos y renovaciones.
      </p>
      <p className="mt-2 text-[11px] text-[var(--muted)]">
        Usa la tabla inferior para revisar precios activos y el ícono de edición por fila.
      </p>
    </Card>
  );
}
