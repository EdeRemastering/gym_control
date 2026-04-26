import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNutritionPlans } from "@/hooks/use-zudel-query";
import { useTrainingStore } from "@/modules/training/store/use-training-store";

type NutritionSessionStatusCardProps = {
  className?: string;
};

export function NutritionSessionStatusCard({ className }: NutritionSessionStatusCardProps) {
  const nutritionPlans = useNutritionPlans();
  const { selectedWeekDay, weeklyNutritionByDay, selectedNutritionPlanId } = useTrainingStore((state) => ({
    selectedWeekDay: state.selectedWeekDay,
    weeklyNutritionByDay: state.weeklyNutritionByDay,
    selectedNutritionPlanId: state.selectedNutritionPlanId,
  }));

  const planName = useMemo(() => {
    const list = nutritionPlans.data ?? [];
    const p = list.find((x) => x.id === selectedNutritionPlanId);
    return p?.name ?? null;
  }, [nutritionPlans.data, selectedNutritionPlanId]);

  const dayMeals = weeklyNutritionByDay[selectedWeekDay] ?? [];
  const foodCount = dayMeals.reduce((acc, m) => acc + m.foods.length, 0);

  return (
    <Card className={cn("border-[var(--border)] bg-white/[0.03] p-4", className)}>
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Plan y día</p>
      <p className="mt-2 text-sm font-semibold text-white">
        {selectedNutritionPlanId && planName ? planName : "Ninguna dieta seleccionada"}
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">
        El resumen bajo <span className="text-white/80">Hoy / Semana</span> refleja el mismo día que marcas con el ojo en el plan
        (misma lógica que entrenar con la rutina en la tabla arriba).
      </p>
      <div className="mt-3 rounded-xl border border-[var(--border)] bg-black/25 px-3 py-2 text-sm text-white">
        <span className="text-[var(--muted)]">Comidas y alimentos en {selectedWeekDay}: </span>
        <span className="font-semibold tabular-nums">
          {dayMeals.length} {dayMeals.length === 1 ? "comida" : "comidas"} · {foodCount} {foodCount === 1 ? "alimento" : "alimentos"}
        </span>
        {nutritionPlans.isLoading ? <span className="ml-2 text-xs text-emerald-200/90">(cargando plan…)</span> : null}
      </div>
      {!selectedNutritionPlanId ? (
        <p className="mt-2 text-xs text-amber-200/90">Selecciona una dieta en el bloque de arriba para enlazar con el gimnasio.</p>
      ) : null}
      {selectedNutritionPlanId && !nutritionPlans.isLoading && dayMeals.length === 0 ? (
        <p className="mt-2 text-xs text-amber-200/90">Este día aún no tiene comidas. Añade bloques con el flujo bajo Hoy (igual que añades ejercicio al entrenar).</p>
      ) : null}
    </Card>
  );
}
