"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(7,14,32,0.96),rgba(4,9,22,0.96))] p-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">¡Bienvenido de vuelta, Admin! 👋</h2>
        <p className="text-xs text-[var(--muted)]">Aquí tienes el resumen general de tu gimnasio.</p>
      </div>
      <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
        <Select defaultValue="neon-dark">
          <SelectTrigger className="h-10 w-full sm:w-auto sm:min-w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="neon-dark">Neon oscuro</SelectItem></SelectContent>
        </Select>
        <Select defaultValue="week">
          <SelectTrigger className="h-10 w-full sm:w-auto sm:min-w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="week">22 - 28 Abr, 2026</SelectItem></SelectContent>
        </Select>
        <Button size="sm" variant="primary" className="h-10 w-full sm:w-auto">Acciones frecuentes</Button>
      </div>
    </div>
  );
}
