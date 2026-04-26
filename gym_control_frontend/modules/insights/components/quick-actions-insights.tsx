"use client";

import { Bell, Bot, ClipboardList, FileDown, LineChart, PlusCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InsightsGlassPanel } from "@/modules/insights/components/insights-glass-panel";
import { useInsightsActions } from "@/modules/insights/hooks/use-insights-actions";

const actions = [
  { id: "report", label: "Generar reporte", icon: LineChart, className: "from-cyan-500/30 to-blue-600/20 border-cyan-400/25" },
  { id: "export", label: "Exportar datos", icon: FileDown, className: "from-violet-500/30 to-fuchsia-600/20 border-violet-400/25" },
  { id: "insight", label: "Crear insight", icon: PlusCircle, className: "from-emerald-500/25 to-teal-600/15 border-emerald-400/25" },
  { id: "alert", label: "Programar alerta", icon: Bell, className: "from-amber-500/25 to-orange-600/15 border-amber-400/25" },
  { id: "review", label: "Revisar alertas", icon: ShieldCheck, className: "from-sky-500/25 to-indigo-600/15 border-sky-400/25" },
  { id: "ai", label: "Configurar IA", icon: Bot, className: "from-fuchsia-500/25 to-rose-600/15 border-fuchsia-400/25" },
  { id: "audit", label: "Programar auditoría", icon: ClipboardList, className: "from-slate-500/25 to-zinc-600/15 border-white/15" },
] as const;

type QuickActionId = (typeof actions)[number]["id"];

function runQuickAction(
  id: QuickActionId,
  openCreateInsight: () => void,
  exportDataset: () => void,
  pushQuickAuditEvent: () => void,
) {
  switch (id) {
    case "insight":
      openCreateInsight();
      break;
    case "export":
      exportDataset();
      break;
    case "review":
      toast.message("Centro de alertas", { description: "Abre el módulo de alertas en la barra lateral." });
      break;
    case "ai":
      toast.message("Configuración IA", { description: "Preferencias de scoring y umbrales (demo)." });
      break;
    case "alert":
      toast.message("Programar alerta", { description: "Plantillas de SLA y canales (demo)." });
      break;
    case "report":
      toast.message("Reporte ejecutivo", { description: "Elige un archivo en el carrusel inferior." });
      break;
    case "audit":
      pushQuickAuditEvent();
      break;
    default:
      break;
  }
}

export function QuickActionsInsights() {
  const { openCreateInsight, exportDataset, pushQuickAuditEvent } = useInsightsActions();

  return (
    <InsightsGlassPanel className="p-4 md:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Automatización</p>
      <h3 className="mt-1 text-lg font-semibold text-white">Acciones rápidas</h3>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Button
              key={a.id}
              type="button"
              variant="ghost"
              className={`h-auto flex-col gap-2 border bg-gradient-to-br py-4 text-center text-xs font-semibold text-white ${a.className}`}
              onClick={() => runQuickAction(a.id, openCreateInsight, exportDataset, pushQuickAuditEvent)}
            >
              <Icon className="h-5 w-5 text-white/90" />
              {a.label}
            </Button>
          );
        })}
      </div>
    </InsightsGlassPanel>
  );
}
