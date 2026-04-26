"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { DailyNutritionSummary } from "@/modules/training/components/nutrition/daily-nutrition-summary";
import { HydrationTrackerCard } from "@/modules/training/components/nutrition/hydration-tracker-card";
import { MacroSummaryCard } from "@/modules/training/components/nutrition/macro-summary-card";
import { MealsListCard } from "@/modules/training/components/nutrition/meals-list-card";
import type { MealBlockView } from "@/modules/training/components/nutrition/meal-block-card";
import { NutritionSessionStatusCard } from "@/modules/training/components/nutrition-session-status-card";
import { SmartNutritionRecommendation } from "@/modules/training/components/nutrition/smart-nutrition-recommendation";
import { useLiveWorkoutDerived } from "@/modules/training/hooks/use-live-workout-derived";
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

const FOOD_EMOJI: Record<string, string> = {
  "Pechuga de pollo": "🍗",
  "Arroz blanco": "🍚",
  "Avena": "🌾",
  "Huevo": "🥚",
  "Plátano": "🍌",
  "Salmón": "🐟",
  "Aguacate": "🥑",
  "Yogur griego": "🥛",
  "Almendras": "🟤",
  "Brócoli": "🥦",
  "Pasta cocida": "🍝",
  "Ternera magra": "🥩",
};

function foodMeta(food: string) {
  return FOOD_NUTRITION[food] ?? { kcal: 120, protein: 8, carbs: 10, fats: 4 };
}

function foodEmoji(food: string) {
  return FOOD_EMOJI[food] ?? "🥗";
}

function defaultGrams(food: string) {
  const seed = food.length;
  return 80 + (seed % 5) * 20;
}

export function NutritionDetailPanels() {
  const { selectedNutritionDetail, seriesProgressPercent } = useLiveWorkoutDerived();
  const {
    selectedWeekDay,
    weeklyNutritionByDay,
    setWeeklyNutritionByDay,
    setNutritionModalDay,
    setNutritionModalSelectedMealId,
    setSelectedMealTypeToCreate,
  } = useTrainingStore((state) => ({
    selectedWeekDay: state.selectedWeekDay,
    weeklyNutritionByDay: state.weeklyNutritionByDay,
    setWeeklyNutritionByDay: state.setWeeklyNutritionByDay,
    setNutritionModalDay: state.setNutritionModalDay,
    setNutritionModalSelectedMealId: state.setNutritionModalSelectedMealId,
    setSelectedMealTypeToCreate: state.setSelectedMealTypeToCreate,
  }));

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

  function openAddFoodModal(mealId: string) {
    setNutritionModalDay(selectedWeekDay);
    setNutritionModalSelectedMealId(mealId);
  }

  function onCreateFirstMealBlock() {
    const existingMeals = weeklyNutritionByDay[selectedWeekDay] ?? [];
    const nextMealType = existingMeals.length ? "LUNCH" : "BREAKFAST";
    const mealId = `meal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setWeeklyNutritionByDay((prev) => ({
      ...prev,
      [selectedWeekDay]: [...(prev[selectedWeekDay] ?? []), { id: mealId, mealType: nextMealType, foods: [] }],
    }));
    setSelectedMealTypeToCreate(nextMealType);
    setNutritionModalDay(selectedWeekDay);
    setNutritionModalSelectedMealId(mealId);
  }

  function openDayEditor() {
    setNutritionModalDay(selectedWeekDay);
    const firstId = (weeklyNutritionByDay[selectedWeekDay] ?? [])[0]?.id ?? null;
    setNutritionModalSelectedMealId(firstId);
  }

  const mealsView: MealBlockView[] = selectedNutritionDetail.meals.map((m) => ({
    id: m.id,
    label: m.label,
    foods: m.foods,
  }));

  return (
    <Card className="border border-white/10 bg-gradient-to-b from-[#0c1224]/95 via-[#080c18]/90 to-[#04060c]/95 shadow-[0_8px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:col-span-3">
      <div className="space-y-6 p-4 md:p-6 xl:grid xl:grid-cols-[1fr_340px] xl:gap-8 xl:space-y-0">
        <div className="space-y-5">
          <NutritionSessionStatusCard />
          <DailyNutritionSummary selectedWeekDay={selectedWeekDay} onEditDay={openDayEditor} />
          <MacroSummaryCard
            totalKcal={dailyTotals.kcal}
            protein={dailyTotals.protein}
            carbs={dailyTotals.carbs}
            fats={dailyTotals.fats}
          />
          <MealsListCard
            meals={mealsView}
            selectedWeekDay={selectedWeekDay}
            onAddFood={openAddFoodModal}
            onCreateFirstMealBlock={onCreateFirstMealBlock}
            foodEmoji={foodEmoji}
            foodKcal={(food) => foodMeta(food).kcal * (defaultGrams(food) / 100)}
            foodGrams={defaultGrams}
          />
        </div>
        <div className="space-y-4">
          <HydrationTrackerCard selectedWeekDay={selectedWeekDay} />
          <SmartNutritionRecommendation
            carbsGrams={dailyTotals.carbs}
            proteinGrams={dailyTotals.protein}
            trainingIntensityHint={`${seriesProgressPercent}% avance de series (sesión)`}
          />
        </div>
      </div>
    </Card>
  );
}
