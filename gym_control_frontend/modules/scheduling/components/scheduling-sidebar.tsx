"use client";

import { CalendarPlus, Clock3, Move, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SchedulingFlow } from "@/modules/scheduling/flows/scheduling-flow";

type FeaturedClass = {
  title: string;
  startsAt: string;
  endsAt: string;
} | null;

type SchedulingSidebarProps = {
  role: string;
  featuredClass: FeaturedClass;
  onCreatedRecurringClass: (isoDate: string) => void;
};

export function SchedulingSidebar({ role, featuredClass, onCreatedRecurringClass }: SchedulingSidebarProps) {
  return (
    <aside className="space-y-4">
      <Card>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white">Crear clase (versión simple)</p>
          <CalendarPlus className="h-4 w-4 text-[var(--primary)]" />
        </div>
        <div className="mt-3 space-y-2 rounded-xl border border-[var(--border)] bg-white/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Cómo crear una clase</p>
          <ol className="space-y-1 text-sm text-white/85">
            <li>1. Ve al timeline semanal.</li>
            <li>2. Haz click sobre el día y la hora deseada.</li>
            <li>3. Se abrirá el modal de creación automáticamente.</li>
            <li>4. Completa datos y confirma.</li>
          </ol>
          <p className="pt-1 text-xs text-[var(--muted)]">Tip: solo puedes crear en celdas vacías del timeline.</p>
        </div>
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white">Crear clase (Scheduling Flow)</p>
          <SlidersHorizontal className="h-4 w-4 text-emerald-300" />
        </div>
        <SchedulingFlow onCreatedRecurringClass={onCreatedRecurringClass} />
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-white">
          <Move className="h-4 w-4 text-[var(--secondary)]" />
          Drag & drop classes
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">Reubica sesiones entre slots para optimizar ocupación. Modo activo para {role}.</p>
        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-2.5">
          <p className="text-xs text-emerald-300">Modo ADMIN activo</p>
          <div className="mt-2 flex items-center justify-between rounded-lg border border-violet-400/30 bg-violet-500/20 p-2">
            <div>
              <p className="text-sm font-semibold text-white">{featuredClass?.title ?? "Clase destacada"}</p>
              <p className="text-xs text-white/70">
                {featuredClass?.startsAt ?? "--:--"} - {featuredClass?.endsAt ?? "--:--"}
              </p>
            </div>
            <Clock3 className="h-4 w-4 text-white/70" />
          </div>
        </div>
      </Card>
    </aside>
  );
}

