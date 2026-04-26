"use client";

import { Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import { WEEK_DAYS } from "@/modules/training/services/training-module.utils";
import { useTrainingStore } from "@/modules/training/store/use-training-store";

const TIPS = [
  "En la fase excéntrica, baja 2–3 s: más control, más estímulo con la misma carga.",
  "Aprieta el suelo con los pies antes de empujar: recruta cadera y rodilla alineadas.",
  "Respira: brida suave en el esfuerzo, exhala en la fase más dura del recorrido.",
  "Descanso activo: camina o moviliza articulaciones entre series para mantener ritmo cardíaco.",
  "Anota sensación 1–10 al final del set: guía para progresar sin fallar técnica.",
];

export function WorkoutTipCard() {
  const selectedWeekDay = useTrainingStore((s) => s.selectedWeekDay);
  const idx = Math.max(0, WEEK_DAYS.indexOf(selectedWeekDay as (typeof WEEK_DAYS)[number]));
  const tip = TIPS[idx % TIPS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 to-[#0b0e14] p-4"
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-400/10 blur-2xl" aria-hidden />
      <div className="relative flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-200">
          <Dumbbell className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/80">Tip del día</p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-200">{tip}</p>
        </div>
      </div>
    </motion.div>
  );
}
