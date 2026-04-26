"use client";

import { BellPlus, CalendarClock, CheckCheck, FileBarChart, UserRoundCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuickActionsPanelProps {
  onMarkAllRead: () => void;
  onCreateAlert: () => void;
}

export function QuickActionsPanel({ onMarkAllRead, onCreateAlert }: QuickActionsPanelProps) {
  const actions = [
    { label: "Marcar todas como leídas", icon: CheckCheck, action: onMarkAllRead },
    { label: "Crear alerta", icon: BellPlus, action: onCreateAlert },
    { label: "Programar recordatorio", icon: CalendarClock, action: onCreateAlert },
    { label: "Generar reporte", icon: FileBarChart, action: onCreateAlert },
    { label: "Asignar responsable", icon: UserRoundCheck, action: onCreateAlert },
  ];
  return (
    <Card className="space-y-2 border-white/10 bg-white/5">
      <p className="text-sm font-medium text-white">Acciones rápidas</p>
      {actions.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.action}
          className="flex w-full items-center gap-2 rounded-lg border border-transparent bg-white/5 px-3 py-2 text-left text-sm text-white transition hover:border-white/20 hover:bg-white/10"
        >
          <item.icon className="h-4 w-4 text-cyan-300" />
          {item.label}
        </button>
      ))}
    </Card>
  );
}
