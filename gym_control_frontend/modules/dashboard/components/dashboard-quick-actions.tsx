"use client";

import { Calendar, CreditCard, PlusCircle, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";

export function DashboardQuickActions() {
  const items = [
    { label: "Crear cliente", icon: PlusCircle },
    { label: "Registrar pago", icon: CreditCard },
    { label: "Programar clase", icon: Calendar },
    { label: "Crear alerta", icon: ShieldAlert },
  ];
  return (
    <Card className="space-y-2 border-white/10 bg-white/5">
      <p className="text-sm font-semibold text-white">Acciones rápidas</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <button key={item.label} type="button" className="flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-black/20 p-2 text-sm text-white transition hover:bg-white/10">
            <item.icon className="h-4 w-4 text-cyan-300" />
            {item.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
