"use client";

import { History, LineChart, Music, StickyNote } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ACTIONS = [
  { id: "notes", label: "Notas de sesión", icon: StickyNote, hint: "Próximamente: editor de notas persistente" },
  { id: "loads", label: "Historial de cargas", icon: History, hint: "Abre el historial por ejercicio (próximamente)" },
  { id: "music", label: "Música / cronómetro", icon: Music, hint: "Enlace externo a tu app de música o timer" },
  { id: "stats", label: "Estadísticas", icon: LineChart, hint: "Resumen semanal en el dashboard" },
] as const;

export function WorkoutQuickControlsPanel() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-md">
      <p className="px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Accesos rápidos</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {ACTIONS.map((a, i) => (
          <motion.button
            key={a.id}
            type="button"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => toast.info(a.label, { description: a.hint })}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#121826] px-3 py-2 text-left text-xs font-medium text-zinc-200 transition hover:border-cyan-500/35 hover:bg-cyan-500/5 hover:text-white"
          >
            <a.icon className="h-3.5 w-3.5 shrink-0 text-cyan-400/90" />
            {a.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/** Alias export for product naming */
export const WorkoutQuickActions = WorkoutQuickControlsPanel;
export const QuickControlsPanel = WorkoutQuickControlsPanel;
