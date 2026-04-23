"use client";

import { Activity, ArrowUpRight, Building2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useActivities, useCheckins, useGyms, useRevenue } from "@/hooks/use-gym-query";
import type { ModuleShellProps } from "@/lib/module-shell-props";

export function DashboardModule({ role }: ModuleShellProps) {
  const gyms = useGyms();
  const revenue = useRevenue();
  const checkins = useCheckins();
  const activities = useActivities();
  const gym = gyms.data?.[0];
  const totalRevenue =
    revenue.data?.reduce((sum, point) => sum + point.value, 0) ?? 0;

  const kpis = [
    {
      label: "Ingresos semanales",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: ArrowUpRight,
    },
    { label: "Clientes activos", value: `${(gyms.data ?? []).length * 2}`, icon: Users },
    { label: "Check-ins recientes", value: `${(checkins.data ?? []).length}`, icon: Activity },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {kpis.map((item) => (
        <Card key={item.label} className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              {item.label}
            </p>
            <item.icon className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="text-3xl font-semibold text-white">{item.value}</p>
        </Card>
      ))}

      <Card className="lg:col-span-2">
        <p className="text-sm text-[var(--muted)]">Timeline del gimnasio</p>
        <div className="mt-3 space-y-3">
          {(activities.data ?? []).length ? (
            (activities.data ?? []).slice(0, 5).map((activity) => (
              <div key={activity.id} className="rounded-xl bg-white/5 p-3 text-sm text-white">
                {activity.type} - {new Date(activity.createdAt).toLocaleString()}
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-white/5 p-4 text-sm text-[var(--muted)]">
              Aún no hay actividad reciente. Comienza creando una rutina, clase o pago para ver movimiento aquí.
            </div>
          )}
        </div>
      </Card>

      <Card>
        <p className="text-sm text-[var(--muted)]">Contexto por rol</p>
        <div className="mt-3 rounded-xl bg-[var(--primary-soft)] p-3 text-sm text-white">
          {role === "ADMIN" && "Visión global de negocio, retención y cashflow."}
          {role === "TRAINER" && "Foco en ejecución de sesiones y progreso de clientes."}
          {role === "CLIENT" && "Seguimiento personal de entrenamiento y pagos."}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]">
          <Building2 className="h-4 w-4" />
          {gym?.name ?? "Gym Control"}
        </div>
      </Card>
    </div>
  );
}
