"use client";

import { CalendarDays, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HydrationTrackerCard } from "@/modules/training/components/nutrition/hydration-tracker-card";
import { MacroSummaryCard } from "@/modules/training/components/nutrition/macro-summary-card";
import { NutritionSessionStatusCard } from "@/modules/training/components/nutrition-session-status-card";
import { SmartNutritionRecommendation } from "@/modules/training/components/nutrition/smart-nutrition-recommendation";
import { useLiveWorkoutDerived } from "@/modules/training/hooks/use-live-workout-derived";
import { WEEK_DAYS } from "@/modules/training/services/training-module.utils";
import { useTrainingStore } from "@/modules/training/store/use-training-store";

const FOOD_NUTRITION: Record<string, { kcal: number; protein: number; carbs: number; fats: number }> = {
  "Pechuga de pollo": { kcal: 165, protein: 31, carbs: 0, fats: 3.6 },
  "Arroz blanco": { kcal: 130, protein: 2.4, carbs: 28, fats: 0.3 },
  "Avena": { kcal: 389, protein: 17, carbs: 66, fats: 7 },
  "Huevo": { kcal: 155, protein: 13, carbs: 1.1, fats: 11 },
  "Plátano": { kcal: 89, protein: 1.1, carbs: 23, fats: 0.3 },
  "Salmón": { kcal: 208, protein: 20, carbs: 0, fats: 13 },
  "Aguacate": { kcal: 160, protein: 2, carbs: 9, fats: 15 },
  "Yogur griego": { kcal: 59, protein: 10, carbs: 3.6, fats: 0.4 },
  "Almendras": { kcal: 579, protein: 21, carbs: 22, fats: 50 },
  "Brócoli": { kcal: 34, protein: 2.8, carbs: 7, fats: 0.4 },
  "Pasta cocida": { kcal: 158, protein: 5.8, carbs: 31, fats: 0.9 },
  "Ternera magra": { kcal: 217, protein: 26, carbs: 0, fats: 12 },
};

const MEAL_TIME: Record<string, string> = {
  Desayuno: "7:30",
  Almuerzo: "13:00",
  Merienda: "16:30",
  Cena: "20:00",
  Snack: "11:00",
  "Pre entreno": "17:00",
  "Post entreno": "19:00",
};

function defaultGrams(food: string) {
  const seed = food.length;
  return 80 + (seed % 5) * 20;
}

function foodMeta(food: string) {
  return FOOD_NUTRITION[food] ?? { kcal: 120, protein: 8, carbs: 10, fats: 4 };
}

export function LiveWorkoutNutritionRail() {
  const [isNutritionWeeklyPlannerOpen, setIsNutritionWeeklyPlannerOpen] = useState(false);
  const { selectedNutritionDetail, seriesProgressPercent } = useLiveWorkoutDerived();
  const selectedWeekDay = useTrainingStore((s) => s.selectedWeekDay);
  const weeklyNutritionByDay = useTrainingStore((s) => s.weeklyNutritionByDay);
  const setSelectedWeekDay = useTrainingStore((s) => s.setSelectedWeekDay);
  const setNutritionModalDay = useTrainingStore((s) => s.setNutritionModalDay);
  const setNutritionModalSelectedMealId = useTrainingStore((s) => s.setNutritionModalSelectedMealId);

  const dailyTotals = useMemo(() => {
    return selectedNutritionDetail.meals.reduce(
      (acc, meal) => {
        meal.foods.forEach((food) => {
          const grams = defaultGrams(food);
          const factor = grams / 100;
          const meta = foodMeta(food);
          acc.kcal += meta.kcal * factor;
          acc.protein += meta.protein * factor;
          acc.carbs += meta.carbs * factor;
          acc.fats += meta.fats * factor;
        });
        return acc;
      },
      { kcal: 0, protein: 0, carbs: 0, fats: 0 },
    );
  }, [selectedNutritionDetail.meals]);

  const meals = selectedNutritionDetail.meals;
  const openEditor = (mealId: string | null) => {
    setNutritionModalDay(selectedWeekDay);
    setNutritionModalSelectedMealId(mealId);
  };
  const openNutritionDayEditor = (day: string) => {
    setSelectedWeekDay(day);
    setNutritionModalDay(day);
    const firstMealId = (weeklyNutritionByDay[day] ?? [])[0]?.id ?? null;
    setNutritionModalSelectedMealId(firstMealId);
    setIsNutritionWeeklyPlannerOpen(false);
  };

  return (
    <aside className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/95 px-3 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 85% 55% at 12% 0%, rgba(124,58,237,0.22), transparent 55%), radial-gradient(ellipse 65% 55% at 100% 20%, rgba(34,211,238,0.12), transparent 58%)",
          }}
          aria-hidden
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-zinc-200">Nutrición</p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-zinc-400">
              <span className="text-zinc-500">Día seleccionada:</span>
              <span className="font-semibold text-white">{selectedWeekDay}</span>
            </p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
              {Math.round(seriesProgressPercent)}% progreso sesión
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-9 w-9 border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
              onClick={() => setIsNutritionWeeklyPlannerOpen(true)}
              aria-label="Abrir editor del plan nutricional del día"
              title="Editar plan"
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-9 w-9 border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
              onClick={() => openEditor(meals[0]?.id ?? null)}
              aria-label="Editar comidas del día"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <NutritionSessionStatusCard />

      <MacroSummaryCard
        className="p-3"
        totalKcal={dailyTotals.kcal}
        protein={dailyTotals.protein}
        carbs={dailyTotals.carbs}
        fats={dailyTotals.fats}
        kcalGoal={2350}
      />

      <div className="rounded-2xl border border-white/10 bg-[#0b1020]/95 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Comidas</p>
        <div className="mt-2 space-y-2">
          {meals.length ? (
            meals.map((meal) => {
              const kcal = Math.round(
                meal.foods.reduce((acc, f) => acc + foodMeta(f).kcal * (defaultGrams(f) / 100), 0),
              );
              const time = MEAL_TIME[meal.label] ?? "—:—";
              return (
                <button
                  key={meal.id}
                  type="button"
                  onClick={() => openEditor(meal.id)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-left transition hover:border-cyan-500/30 hover:bg-cyan-500/5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-cyan-200/80">{time}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{kcal} kcal</span>
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-white">{meal.label}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {meal.foods.slice(0, 4).map((food) => (
                      <span
                        key={`${meal.id}-${food}`}
                        className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-white/10 bg-black/25 px-1 text-[10px] text-zinc-200"
                      >
                        {food.slice(0, 2)}
                      </span>
                    ))}
                    {meal.foods.length > 4 ? (
                      <span className="text-[10px] font-semibold text-zinc-500">+{meal.foods.length - 4}</span>
                    ) : null}
                  </div>
                </button>
              );
            })
          ) : (
            <p className="text-xs text-zinc-500">Sin comidas. Añade el primer bloque.</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          className="mt-2 h-9 w-full border border-white/10 text-xs text-zinc-300"
          onClick={() => openEditor(meals[0]?.id ?? null)}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Agregar comida
        </Button>
      </div>

      <HydrationTrackerCard selectedWeekDay={selectedWeekDay} />

      <SmartNutritionRecommendation
        carbsGrams={dailyTotals.carbs}
        proteinGrams={dailyTotals.protein}
        trainingIntensityHint={`${seriesProgressPercent}% avance de series (sesión)`}
      />

      <Dialog open={isNutritionWeeklyPlannerOpen} onOpenChange={setIsNutritionWeeklyPlannerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Planificador semanal de nutrición</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-[var(--muted)]">Selecciona un día para ajustar comidas y alimentos de ese día.</p>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-left text-xs text-white">
              <thead>
                <tr>
                  {WEEK_DAYS.map((day) => (
                    <th
                      key={`nutrition-live-head-${day}`}
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
                    const dayMeals = weeklyNutritionByDay[day] ?? [];
                    const foodCount = dayMeals.reduce((acc, meal) => acc + meal.foods.length, 0);
                    return (
                      <td key={`nutrition-live-cell-${day}`} className="px-2 py-2 align-top">
                        <Button
                          type="button"
                          variant="ghost"
                          className={`h-auto w-full justify-start rounded-md border px-2 py-2 text-left transition ${
                            selectedWeekDay === day
                              ? "border-cyan-400/40 bg-cyan-500/12 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.22)]"
                              : "border-[var(--border)] bg-black/20 hover:bg-white/10"
                          }`}
                          onClick={() => openNutritionDayEditor(day)}
                        >
                          <div>
                            <p className="text-white">{dayMeals.length} comidas</p>
                            <p className="text-[10px] text-[var(--muted)]">{foodCount} alimentos · Editar día</p>
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
    </aside>
  );
}
