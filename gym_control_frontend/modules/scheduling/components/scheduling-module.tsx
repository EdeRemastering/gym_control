"use client";

import { FormEvent, useState } from "react";
import { CalendarDays, Move } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateClass } from "@/hooks/use-gym-mutations";
import { useClasses, useSchedule } from "@/hooks/use-gym-query";
import type { ModuleShellProps } from "@/lib/module-shell-props";
import { SchedulingFlow } from "@/modules/scheduling/flows/scheduling-flow";
import { EntityActionMenu } from "@/modules/action-system/components/entity-action-menu";
import { toast } from "sonner";

export function SchedulingModule({ role }: ModuleShellProps) {
  const scheduleQuery = useSchedule();
  const classesQuery = useClasses();
  const createClass = useCreateClass();
  const scheduleItems = scheduleQuery.data ?? [];
  const [form, setForm] = useState({
    name: "",
    description: "",
    capacity: "20",
  });
  const [closedClassIds, setClosedClassIds] = useState<string[]>([]);

  async function onCreateClass(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;
    await createClass.mutateAsync({
      name: form.name,
      description: form.description || undefined,
      capacity: Number(form.capacity),
    });
    setForm({ name: "", description: "", capacity: "20" });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <div className="flex items-center gap-2 text-white">
          <CalendarDays className="h-4 w-4 text-[var(--primary)]" />
          Timeline semanal interactiva
        </div>
        <div className="mt-4 space-y-2">
          {scheduleItems
            .filter((item) => !closedClassIds.includes(item.id))
            .map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white/5 p-3"
            >
              <div>
                <p className="text-sm text-white">{item.title}</p>
                <p className="text-xs text-[var(--muted)]">
                  {item.startsAt} - {item.endsAt} | Coach {item.trainer}
                </p>
              </div>
              <div className="max-w-sm">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    item.occupancy >= 80
                      ? "bg-emerald-500/20 text-emerald-200"
                      : item.occupancy >= 50
                        ? "bg-indigo-500/20 text-indigo-200"
                        : "bg-gray-500/20 text-gray-200"
                  }`}
                >
                  {item.occupancy}% ocupado
                </span>
                <EntityActionMenu
                  title="Clase"
                  actions={[
                    {
                      id: `close-${item.id}`,
                      label: "Cerrar clase",
                      kind: "state",
                      run: () => setClosedClassIds((prev) => [...prev, item.id]),
                    },
                    {
                      id: `reschedule-${item.id}`,
                      label: "Reprogramar",
                      kind: "flow",
                      run: () => toast.success(`Reprogramación iniciada: ${item.title}`),
                    },
                    {
                      id: `cancel-booking-${item.id}`,
                      label: "Cancelar reservas",
                      kind: "bulk",
                      run: () => toast.success(`Reservas canceladas para ${item.title}`),
                    },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-white">
          <Move className="h-4 w-4 text-[var(--secondary)]" />
          Drag & drop classes
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Reubica sesiones entre slots para optimizar ocupación.
        </p>
        <p className="mt-2 text-xs text-white">Modo activo para {role}</p>
      </Card>

      <Card>
        <p className="text-sm text-[var(--muted)]">Crear clase</p>
        <form className="mt-3 space-y-2" onSubmit={onCreateClass}>
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
            placeholder="Nombre"
          />
          <input
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
            placeholder="Descripción"
          />
          <input
            value={form.capacity}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, capacity: event.target.value }))
            }
            className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
            placeholder="Capacidad"
          />
          <Button type="submit" size="sm" className="w-full" loading={createClass.isPending}>
            Guardar clase
          </Button>
        </form>
      </Card>

      <Card className="lg:col-span-2">
        <p className="text-sm text-[var(--muted)]">Catálogo de clases reales</p>
        <div className="mt-3 space-y-2">
          {(classesQuery.data ?? []).slice(0, 6).map((item) => (
            <div key={item.id} className="rounded-lg bg-white/5 p-2 text-sm text-white">
              {item.name} - Capacidad {item.capacity}
            </div>
          ))}
        </div>
      </Card>

      <div className="lg:col-span-3">
        <SchedulingFlow />
      </div>
    </div>
  );
}
