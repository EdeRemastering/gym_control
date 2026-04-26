"use client";

import { CalendarRange, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { WEEK_DAYS } from "@/modules/training/services/training-module.utils";

type Props = {
  selectedWeekDay: string;
  onEditDay: () => void;
};

export function DailyNutritionSummary({ selectedWeekDay, onEditDay }: Props) {
  const dayIndex = WEEK_DAYS.indexOf(selectedWeekDay as (typeof WEEK_DAYS)[number]);
  const label = dayIndex >= 0 ? WEEK_DAYS[dayIndex] : selectedWeekDay;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950/50 to-[#080c14] p-5 shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
    >
      <div
        className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
            <CalendarRange className="h-3.5 w-3.5 text-cyan-400" />
            Nutrición del día
          </p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">{label}</h3>
          <p className="mt-1 text-sm text-zinc-400">Plan diario · macros y comidas en un vistazo.</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-2 rounded-full border-violet-500/30 bg-violet-500/15 text-violet-100 hover:bg-violet-500/25"
          onClick={onEditDay}
        >
          <Pencil className="h-4 w-4" />
          Editar día
        </Button>
      </div>
    </motion.div>
  );
}
