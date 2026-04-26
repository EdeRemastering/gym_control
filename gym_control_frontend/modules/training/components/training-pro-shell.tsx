"use client";

import { useState } from "react";
import { CalendarDays, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LiveWorkoutProSessionLayout } from "@/modules/training/components/live-workout-pro-session-layout";
import { WEEK_DAYS } from "@/modules/training/services/training-module.utils";
import { useTrainingStore } from "@/modules/training/store/use-training-store";

export function TrainingProShell() {
  const [isTrainingWeeklyPlannerOpen, setIsTrainingWeeklyPlannerOpen] = useState(false);
  const { selectedWeekDay, weeklyRoutineByDay, setSelectedWeekDay, setTrainingModalDay, setTrainingModalExerciseId } = useTrainingStore((s) => ({
    selectedWeekDay: s.selectedWeekDay,
    weeklyRoutineByDay: s.weeklyRoutineByDay,
    setSelectedWeekDay: s.setSelectedWeekDay,
    setTrainingModalDay: s.setTrainingModalDay,
    setTrainingModalExerciseId: s.setTrainingModalExerciseId,
  }));

  const openTrainingDayEditor = (day: string) => {
    setSelectedWeekDay(day);
    setTrainingModalDay(day);
    const firstExerciseId = (weeklyRoutineByDay[day] ?? [])[0]?.id ?? "";
    setTrainingModalExerciseId(firstExerciseId);
    setIsTrainingWeeklyPlannerOpen(false);
  };

  return (
    <div className="relative flex min-h-[min(100dvh,920px)] flex-col overflow-hidden bg-[#070a12] text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% -10%, rgba(124,58,237,0.26), transparent 56%), radial-gradient(ellipse 50% 35% at 100% 0%, rgba(34,211,238,0.12), transparent 52%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:22px_22px]" />

      <header className="relative border-b border-white/10 bg-[#070b14]/95 px-3 py-3 md:px-5">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-950/30 to-transparent" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Dumbbell className="h-4 w-4 text-cyan-200" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold tracking-[0.2em] text-zinc-300">ENTRENAMIENTO</p>
                <p className="truncate text-xs text-zinc-500">Sesión, descanso y nutrición en un vistazo</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
            aria-label="Calendario"
            onClick={() => setIsTrainingWeeklyPlannerOpen(true)}
          >
            <CalendarDays className="h-4 w-4" />
          </button>
        </div>
      </header>

      <LiveWorkoutProSessionLayout />

      <Dialog open={isTrainingWeeklyPlannerOpen} onOpenChange={setIsTrainingWeeklyPlannerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Planificador semanal de entrenamiento</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-[var(--muted)]">Selecciona un día para ajustar rutina, ejercicios y configuración del día.</p>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-left text-xs text-white">
              <thead>
                <tr>
                  {WEEK_DAYS.map((day) => (
                    <th
                      key={`training-live-head-${day}`}
                      className={`px-2 py-1 font-medium ${selectedWeekDay === day ? "text-cyan-200" : "text-[var(--muted)]"}`}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {WEEK_DAYS.map((day) => {
                    const exerciseCount = (weeklyRoutineByDay[day] ?? []).length;
                    return (
                      <td key={`training-live-cell-${day}`} className="px-2 py-2 align-top">
                        <Button
                          type="button"
                          variant="ghost"
                          className={`h-auto w-full justify-start rounded-md border px-2 py-2 text-left transition ${
                            selectedWeekDay === day
                              ? "border-cyan-400/40 bg-cyan-500/12 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.22)]"
                              : "border-[var(--border)] bg-black/20 hover:bg-white/10"
                          }`}
                          onClick={() => openTrainingDayEditor(day)}
                        >
                          <div>
                            <p className="text-white">{exerciseCount} ejercicios</p>
                            <p className="text-[10px] text-[var(--muted)]">Editar día</p>
                          </div>
                        </Button>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

