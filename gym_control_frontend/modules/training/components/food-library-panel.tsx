"use client";

import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLiveWorkoutDerived } from "@/modules/training/hooks/use-live-workout-derived";

/**
 * Resumen de la biblioteca de alimentos disponible para el plan del día.
 * (El catálogo interactivo completo vive en `NutritionDayModal`.)
 */
export function FoodLibraryPanel() {
  const { nutritionFoodCatalog } = useLiveWorkoutDerived();
  const preview = nutritionFoodCatalog.slice(0, 8);
  return (
    <Card className="border-white/10 bg-white/[0.02] p-4">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
        <BookOpen className="h-3.5 w-3.5" />
        Biblioteca rápida
      </p>
      <p className="mt-1 text-xs text-zinc-500">Usa &quot;Editar día&quot; o una comida para abrir el buscador completo.</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {preview.length ? (
          preview.map((f) => (
            <span key={f} className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[11px] text-zinc-200">
              {f}
            </span>
          ))
        ) : (
          <span className="text-sm text-zinc-500">Sin alimentos en caché aún</span>
        )}
      </div>
    </Card>
  );
}
