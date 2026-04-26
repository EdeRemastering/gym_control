"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MealBlockView = {
  id: string;
  label: string;
  foods: string[];
};

type Props = {
  meal: MealBlockView;
  foodEmoji: (food: string) => string;
  foodKcal: (food: string) => number;
  foodGrams: (food: string) => number;
  onAddFood: (mealId: string) => void;
};

export function MealBlockCard({ meal, foodEmoji, foodKcal, foodGrams, onAddFood }: Props) {
  const totalKcal = meal.foods.reduce((acc, f) => acc + foodKcal(f), 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-inner backdrop-blur-sm transition hover:border-cyan-500/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300/80">{meal.label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-white">{Math.round(totalKcal)}</p>
          <p className="text-[10px] font-medium text-zinc-500">kcal estimadas</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="shrink-0 text-cyan-200/90 hover:bg-cyan-500/10 hover:text-cyan-100"
          onClick={() => onAddFood(meal.id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {meal.foods.length ? (
          meal.foods.map((food) => (
            <span
              key={`${meal.id}-${food}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-xs text-zinc-200"
            >
              <span className="text-base" aria-hidden>
                {foodEmoji(food)}
              </span>
              <span className="max-w-[8rem] truncate">{food}</span>
              <span className="tabular-nums text-zinc-500">{Math.round(foodGrams(food))}g</span>
            </span>
          ))
        ) : (
          <p className="text-sm text-zinc-500">Sin alimentos · añade desde la biblioteca</p>
        )}
      </div>
    </div>
  );
}
