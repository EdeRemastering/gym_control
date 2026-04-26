import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNutritionMeals, useNutritionPlans } from "@/hooks/use-zudel-query";
import { useNutritionStore } from "@/modules/nutrition/store/use-nutrition-store";
import { MEAL_TYPES } from "@/modules/training/services/training-module.utils";

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

function emojiForFood(food: string) {
  return FOOD_EMOJI[food] ?? "🥗";
}

export function NutritionDayModal() {
  const [isFoodLibraryOpen, setIsFoodLibraryOpen] = useState(false);
  const [isNewFoodModalOpen, setIsNewFoodModalOpen] = useState(false);
  const [foodSearch, setFoodSearch] = useState("");
  const [newFoodDraft, setNewFoodDraft] = useState({
    emoji: "🥗",
    name: "",
    kcal: "",
    protein: "",
    carbs: "",
    fats: "",
  });
  const nutritionPlans = useNutritionPlans();
  const selectedNutritionPlanId = useNutritionStore((s) => s.selectedNutritionPlanId);
  const activeNutritionPlanId = useMemo(() => {
    const list = nutritionPlans.data ?? [];
    const first = list[0]?.id;
    if (selectedNutritionPlanId && list.some((p) => p.id === selectedNutritionPlanId)) {
      return selectedNutritionPlanId;
    }
    return first;
  }, [nutritionPlans.data, selectedNutritionPlanId]);
  const nutritionMealsQuery = useNutritionMeals(activeNutritionPlanId);
  const {
    nutritionModalDay,
    selectedMealTypeToCreate,
    nutritionModalSelectedMealId,
    nutritionModalFoodDraft,
    weeklyNutritionByDay,
    customNutritionFoods,
    setSelectedMealTypeToCreate,
    setNutritionModalSelectedMealId,
    setNutritionModalFoodDraft,
    setWeeklyNutritionByDay,
    setCustomNutritionFoods,
    setNutritionModalDay,
  } = useNutritionStore((state) => ({
    nutritionModalDay: state.nutritionModalDay,
    selectedMealTypeToCreate: state.selectedMealTypeToCreate,
    nutritionModalSelectedMealId: state.nutritionModalSelectedMealId,
    nutritionModalFoodDraft: state.nutritionModalFoodDraft,
    weeklyNutritionByDay: state.weeklyNutritionByDay,
    customNutritionFoods: state.customNutritionFoods,
    setSelectedMealTypeToCreate: state.setSelectedMealTypeToCreate,
    setNutritionModalSelectedMealId: state.setNutritionModalSelectedMealId,
    setNutritionModalFoodDraft: state.setNutritionModalFoodDraft,
    setWeeklyNutritionByDay: state.setWeeklyNutritionByDay,
    setCustomNutritionFoods: state.setCustomNutritionFoods,
    setNutritionModalDay: state.setNutritionModalDay,
  }));

  const nutritionFoodCatalog = Array.from(
    new Set([
      ...(nutritionMealsQuery.data ?? [])
        .map((meal) => meal.description?.trim())
        .filter((value): value is string => Boolean(value)),
      ...customNutritionFoods,
    ]),
  );
  const filteredFoodCatalog = useMemo(() => {
    const query = foodSearch.trim().toLowerCase();
    if (!query) return nutritionFoodCatalog;
    return nutritionFoodCatalog.filter((food) => food.toLowerCase().includes(query));
  }, [foodSearch, nutritionFoodCatalog]);

  function addMealBlock(day: string, mealType: string) {
    setWeeklyNutritionByDay((prev) => ({
      ...prev,
      [day]: [
        ...(prev[day] ?? []),
        { id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, mealType, foods: [] },
      ],
    }));
  }

  function addCatalogFoodFromModal() {
    const normalized = nutritionModalFoodDraft.trim();
    if (!normalized) return;
    setCustomNutritionFoods((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
    if (!nutritionModalDay || !nutritionModalSelectedMealId) {
      setNutritionModalFoodDraft("");
      return;
    }
    setWeeklyNutritionByDay((prev) => ({
      ...prev,
      [nutritionModalDay]: (prev[nutritionModalDay] ?? []).map((meal) =>
        meal.id === nutritionModalSelectedMealId && !meal.foods.includes(normalized)
          ? { ...meal, foods: [...meal.foods, normalized] }
          : meal,
      ),
    }));
    setNutritionModalFoodDraft("");
  }

  function addFoodToSelectedMeal(food: string) {
    if (!nutritionModalDay || !nutritionModalSelectedMealId) return;
    setWeeklyNutritionByDay((prev) => ({
      ...prev,
      [nutritionModalDay]: (prev[nutritionModalDay] ?? []).map((meal) =>
        meal.id === nutritionModalSelectedMealId && !meal.foods.includes(food)
          ? { ...meal, foods: [...meal.foods, food] }
          : meal,
      ),
    }));
  }

  function saveNewFood() {
    const name = newFoodDraft.name.trim();
    if (!name) return;
    setCustomNutritionFoods((prev) => (prev.includes(name) ? prev : [...prev, name]));
    if (nutritionModalDay && nutritionModalSelectedMealId) {
      addFoodToSelectedMeal(name);
    }
    setNewFoodDraft({
      emoji: "🥗",
      name: "",
      kcal: "",
      protein: "",
      carbs: "",
      fats: "",
    });
    setIsNewFoodModalOpen(false);
  }

  function removeFoodFromMeal(day: string, mealId: string, foodIndex: number) {
    setWeeklyNutritionByDay((prev) => ({
      ...prev,
      [day]: (prev[day] ?? []).map((meal) =>
        meal.id === mealId ? { ...meal, foods: meal.foods.filter((_, index) => index !== foodIndex) } : meal,
      ),
    }));
  }

  const selectedMealFoods =
    nutritionModalDay && nutritionModalSelectedMealId
      ? (weeklyNutritionByDay[nutritionModalDay] ?? []).find((meal) => meal.id === nutritionModalSelectedMealId)?.foods ?? []
      : [];

  return (
    <Dialog
      open={Boolean(nutritionModalDay)}
      onOpenChange={(open) => {
        if (!open) {
          setNutritionModalDay(null);
          setNutritionModalSelectedMealId(null);
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Plan nutricional de {nutritionModalDay ?? ""}</DialogTitle>
          <DialogDescription>
            Selecciona un bloque de comida, agrega alimentos del catálogo o crea nuevos.
          </DialogDescription>
        </DialogHeader>
        {nutritionModalDay ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="space-y-1">
                <label className="text-xs text-[var(--muted)]">Tipo de comida</label>
                <Select value={selectedMealTypeToCreate} onValueChange={setSelectedMealTypeToCreate}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Tipo de comida" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((mealType) => (
                      <SelectItem key={`modal-meal-type-${mealType.value}`} value={mealType.value}>
                        {mealType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={() => addMealBlock(nutritionModalDay, selectedMealTypeToCreate)}>
                Agregar bloque
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
                <p className="text-xs text-[var(--muted)]">Bloques del día</p>
                <div className="mt-2 space-y-2">
                  {(weeklyNutritionByDay[nutritionModalDay] ?? []).map((meal) => (
                    <button
                      key={`nutrition-modal-meal-${meal.id}`}
                      type="button"
                      className={`w-full rounded-md border px-2 py-2 text-left text-sm ${
                        nutritionModalSelectedMealId === meal.id
                          ? "border-emerald-300 bg-emerald-500/20"
                          : "border-[var(--border)] bg-black/20"
                      }`}
                      onClick={() => setNutritionModalSelectedMealId(meal.id)}
                    >
                      {MEAL_TYPES.find((item) => item.value === meal.mealType)?.label ?? meal.mealType}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
                <p className="text-xs text-[var(--muted)]">Biblioteca de alimentos</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Ábrela para ver todos los alimentos en cards y añadir al bloque seleccionado.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => setIsFoodLibraryOpen(true)}>
                    Abrir biblioteca
                  </Button>
                  <Button type="button" size="sm" onClick={() => setIsNewFoodModalOpen(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Nuevo alimento
                  </Button>
                </div>
                <div className="mt-3 flex gap-2">
                  <div className="w-full space-y-1">
                    <label className="text-xs text-[var(--muted)]">Nombre del alimento</label>
                    <input
                      value={nutritionModalFoodDraft}
                      onChange={(event) => setNutritionModalFoodDraft(event.target.value)}
                      placeholder="Ej: Avena cocida"
                      className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                    />
                  </div>
                  <Button size="sm" onClick={addCatalogFoodFromModal}>
                    Crear
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-white/5 p-3">
              <p className="text-xs text-[var(--muted)]">Detalle del bloque seleccionado</p>
              {nutritionModalSelectedMealId ? (
                <div className="mt-2">
                  {selectedMealFoods.length ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedMealFoods.map((food, index) => (
                        <button
                          key={`selected-food-${food}-${index}`}
                          type="button"
                          className="rounded-full border border-[var(--border)] bg-black/20 px-2 py-1 text-xs text-white hover:bg-white/10"
                          onClick={() => removeFoodFromMeal(nutritionModalDay, nutritionModalSelectedMealId, index)}
                        >
                          {food} ×
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--muted)]">Este bloque aún no tiene alimentos.</p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-sm text-[var(--muted)]">Selecciona un bloque de comida.</p>
              )}
            </div>

            <Dialog open={isFoodLibraryOpen} onOpenChange={setIsFoodLibraryOpen}>
              <DialogContent className="max-w-5xl">
                <DialogHeader>
                  <DialogTitle>Alimentos</DialogTitle>
                  <DialogDescription>Tu base reutilizable para construir comidas.</DialogDescription>
                </DialogHeader>
                <div className="relative">
                  <label className="mb-1 block text-xs text-[var(--muted)]">Buscar alimento</label>
                  <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-[var(--muted)]" />
                  <input
                    value={foodSearch}
                    onChange={(event) => setFoodSearch(event.target.value)}
                    placeholder="Buscar alimento..."
                    className="w-full rounded-xl border border-[var(--border)] bg-black/20 py-2 pr-3 pl-9 text-sm text-white"
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredFoodCatalog.map((food) => (
                    <article
                      key={`food-library-${food}`}
                      className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/[0.03] p-3"
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        <span className="text-2xl">{emojiForFood(food)}</span>
                        <p className="truncate text-lg font-medium text-white">{food}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => addFoodToSelectedMeal(food)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isNewFoodModalOpen} onOpenChange={setIsNewFoodModalOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nuevo alimento</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--muted)]">Emoji</label>
                      <input
                        value={newFoodDraft.emoji}
                        onChange={(event) => setNewFoodDraft((prev) => ({ ...prev, emoji: event.target.value }))}
                        placeholder="🥗"
                        className="w-16 rounded-xl border border-[var(--border)] bg-black/20 p-2 text-center text-xl text-white"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-[var(--muted)]">Nombre del alimento</label>
                      <input
                        value={newFoodDraft.name}
                        onChange={(event) => setNewFoodDraft((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Ej: Yogur griego"
                        className="flex-1 rounded-xl border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--muted)]">Calorías (kcal/100g)</label>
                      <input
                        value={newFoodDraft.kcal}
                        onChange={(event) => setNewFoodDraft((prev) => ({ ...prev, kcal: event.target.value }))}
                        placeholder="120"
                        className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--muted)]">Proteína (g)</label>
                      <input
                        value={newFoodDraft.protein}
                        onChange={(event) => setNewFoodDraft((prev) => ({ ...prev, protein: event.target.value }))}
                        placeholder="10"
                        className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--muted)]">Carbohidratos (g)</label>
                      <input
                        value={newFoodDraft.carbs}
                        onChange={(event) => setNewFoodDraft((prev) => ({ ...prev, carbs: event.target.value }))}
                        placeholder="15"
                        className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--muted)]">Grasas (g)</label>
                      <input
                        value={newFoodDraft.fats}
                        onChange={(event) => setNewFoodDraft((prev) => ({ ...prev, fats: event.target.value }))}
                        placeholder="5"
                        className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2 text-sm text-white"
                      />
                    </div>
                  </div>
                  <Button className="w-full" onClick={saveNewFood}>
                    Guardar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
