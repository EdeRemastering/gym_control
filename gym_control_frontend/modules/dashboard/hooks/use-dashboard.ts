import { useMemo } from "react";
import { ArrowUpRight, CreditCard, UserPlus, Users, UserX, Wallet } from "lucide-react";
import { useActivities, useCheckins, useGyms, useRevenue } from "@/hooks/use-zudel-query";
import type { ModuleShellProps } from "@/lib/module-shell-props";
import type { DashboardAlert, DashboardInsight, DashboardKpi } from "@/modules/dashboard/types/dashboard-pro.types";

export function useDashboard(role: ModuleShellProps["role"]) {
  const gyms = useGyms();
  const revenue = useRevenue();
  const checkins = useCheckins();
  const activities = useActivities();
  const gym = gyms.data?.[0];
  const totalRevenue = revenue.data?.reduce((sum, point) => sum + point.value, 0) ?? 0;

  const kpis = useMemo<DashboardKpi[]>(
    () =>
      [
        { label: "Ingresos del mes", value: `$${totalRevenue.toLocaleString()}`, delta: "+18.4% vs mes anterior", icon: Wallet, tone: "text-fuchsia-300" },
        { label: "Nuevos clientes", value: `${(gyms.data ?? []).length * 8}`, delta: "+14.2% vs mes anterior", icon: UserPlus, tone: "text-cyan-300" },
        { label: "Membresías activas", value: `${(checkins.data ?? []).length + 120}`, delta: "+8.7% vs mes anterior", icon: CreditCard, tone: "text-emerald-300" },
        { label: "Cancelaciones", value: "7", delta: "+2.5% vs mes anterior", icon: UserX, tone: "text-amber-300" },
        { label: "Asistencia promedio", value: "78%", delta: "+10.1% semana anterior", icon: Users, tone: "text-cyan-300" },
        { label: "Retención", value: "92%", delta: "+6.3% vs mes anterior", icon: ArrowUpRight, tone: "text-violet-300" },
      ] as DashboardKpi[],
    [totalRevenue, gyms.data, checkins.data],
  );

  const alerts = useMemo<DashboardAlert[]>(
    () => [
      { id: "a1", title: "3 pagos vencidos", hint: "Requieren atención inmediata", at: "Hace 15 min" },
      { id: "a2", title: "5 clientes en riesgo", hint: "Podrían cancelar su membresía", at: "Hace 1 hora" },
      { id: "a3", title: "Inventario bajo", hint: "4 productos con stock mínimo", at: "Hace 3 horas" },
    ],
    [],
  );

  const insights = useMemo<DashboardInsight[]>(
    () => [
      { id: "i1", title: "3 clientes en riesgo de cancelación", description: "Tienen baja asistencia en las últimas 2 semanas.", cta: "Ver detalles" },
      { id: "i2", title: "Sede Norte bajó 12% en asistencia", description: "Comparado con la semana anterior.", cta: "Ver reporte" },
      { id: "i3", title: "Mejor rendimiento de entrenadores", description: "Felicitaciones a Laura Gomez por su desempeño.", cta: "Ver ranking" },
    ],
    [],
  );

  const activity = useMemo(
    () =>
      (activities.data ?? []).slice(0, 5).map((item, index) => ({
        id: item.id,
        label: item.type.replaceAll("_", " "),
        at: index === 0 ? "Hace 10 min" : `Hace ${index + 1} horas`,
      })),
    [activities.data],
  );

  const roleContext =
    role === "ADMIN"
      ? "Visión global de negocio, retención y cashflow."
      : role === "TRAINER"
        ? "Foco en ejecución de sesiones y progreso de clientes."
        : "Seguimiento personal de entrenamiento y pagos.";

  return { activities, gym, kpis, roleContext, totalRevenue, alerts, insights, activity };
}
