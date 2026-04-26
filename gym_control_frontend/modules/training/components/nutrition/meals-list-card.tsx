"use client";

import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MealBlockCard, type MealBlockView } from "@/modules/training/components/nutrition/meal-block-card";
import { WEEK_DAYS } from "@/modules/training/services/training-module.utils";

type Props = {
  meals: MealBlockView[];
  selectedWeekDay: string;
  onAddFood: (mealId: string) => void;
  onCreateFirstMealBlock: () => void;
  foodEmoji: (food: string) => string;
  foodKcal: (food: string) => number;
  foodGrams: (food: string) => number;
};

export function MealsListCard({
  meals,
  selectedWeekDay,
  onAddFood,
  onCreateFirstMealBlock,
  foodEmoji,
  foodKcal,
  foodGrams,
}: Props) {
  const dayLabel = WEEK_DAYS.includes(selectedWeekDay as (typeof WEEK_DAYS)[number]) ? selectedWeekDay : selectedWeekDay;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Comidas · {dayLabel}</h4>
        <p className="text-xs text-zinc-500">
          {meals.length} bloque{meals.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="space-y-3">
        {meals.length ? (
          meals.map((meal) => (
            <motion.div key={meal.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <MealBlockCard meal={meal} foodEmoji={foodEmoji} foodKcal={foodKcal} foodGrams={foodGrams} onAddFood={onAddFood} />
            </motion.div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/5 p-6 text-center">
            <p className="text-sm text-zinc-400">Aún no hay comidas programadas.</p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4 border-violet-500/40 bg-violet-500/15 text-violet-100"
              onClick={onCreateFirstMealBlock}
            >
              <Plus className="h-4 w-4" />
              Crear primer bloque
            </Button>
          </div>
        )}
      </div>
      {meals.length ? (
        <Button
          type="button"
          variant="ghost"
          className="w-full border border-white/10 text-zinc-300 hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-cyan-100"
          onClick={onCreateFirstMealBlock}
        >
          <Plus className="h-4 w-4" />
          Agregar comida
        </Button>
      ) : null}
    </div>
  );
}
