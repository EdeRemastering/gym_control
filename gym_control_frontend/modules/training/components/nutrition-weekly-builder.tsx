import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLiveWorkoutDerived } from "@/modules/training/hooks/use-live-workout-derived";
import { WEEK_DAYS } from "@/modules/training/services/training-module.utils";
import { useTrainingStore } from "@/modules/training/store/use-training-store";

export function NutritionWeeklyBuilder() {
  const [isNutritionPlannerOpen, setIsNutritionPlannerOpen] = useState(false);
  const weeklyNutritionPlan = useLiveWorkoutDerived().weeklyNutritionPlan;
  const {
    weeklyNutritionByDay,
    setNutritionModalDay,
    setNutritionModalSelectedMealId,
  } = useTrainingStore((state) => ({
    weeklyNutritionByDay: state.weeklyNutritionByDay,
    setNutritionModalDay: state.setNutritionModalDay,
    setNutritionModalSelectedMealId: state.setNutritionModalSelectedMealId,
  }));

  const openNutritionDayModal = (day: string) => {
    setNutritionModalDay(day);
    const firstMealId = (weeklyNutritionByDay[day] ?? [])[0]?.id ?? null;
    setNutritionModalSelectedMealId(firstMealId);
  };

  return (
    <div className="mt-4 rounded-xl border border-[var(--border)] bg-black/20">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-semibold text-white">Nutrición por semana</span>
        <Button type="button" size="sm" variant="secondary" onClick={() => setIsNutritionPlannerOpen(true)}>
          Abrir plan semanal
        </Button>
      </div>
      <Dialog open={isNutritionPlannerOpen} onOpenChange={setIsNutritionPlannerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Tabla semanal nutricional</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-[var(--muted)]">Haz click en el día para abrir el modal y asignar alimentos o crear nuevos.</p>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-left text-xs text-white">
              <thead>
                <tr>
                  {WEEK_DAYS.map((day) => (
                    <th key={`nutrition-head-${day}`} className="px-2 py-1 font-medium text-[var(--muted)]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {WEEK_DAYS.map((day) => {
                    const mealCount = weeklyNutritionPlan.find((item) => item.day === day)?.meals.length ?? 0;
                    return (
                      <td key={`nutrition-cell-${day}`} className="px-2 py-2">
                        <button
                          type="button"
                          className="w-full rounded-md border border-[var(--border)] bg-black/20 px-2 py-2 text-left transition hover:bg-white/10"
                          onClick={() => openNutritionDayModal(day)}
                        >
                          <p>{mealCount} comidas</p>
                          <p className="text-[10px] text-[var(--muted)]">Editar día</p>
                        </button>
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

