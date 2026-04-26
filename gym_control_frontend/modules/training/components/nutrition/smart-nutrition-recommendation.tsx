"use client";

import { Brain, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  carbsGrams: number;
  proteinGrams: number;
  trainingIntensityHint: string;
};

export function SmartNutritionRecommendation({ carbsGrams, proteinGrams, trainingIntensityHint }: Props) {
  const suggestCarb = carbsGrams < 200 ? 15 : 10;
  const text =
    proteinGrams < 120
      ? `Añade ~10g de proteína en la próxima comida; vas en ${proteinGrams.toFixed(0)}g.`
      : `Buen balance. Considera +${suggestCarb}g de carbos si la sesión supera 45 min de trabajo intenso.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-950/60 to-[#060912] p-5"
    >
      <div
        className="pointer-events-none absolute -right-6 top-0 h-28 w-28 rounded-full bg-fuchsia-500/15 blur-2xl"
        aria-hidden
      />
      <div className="relative flex gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/20 text-violet-200">
          <Brain className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/80">
            <Sparkles className="h-3 w-3" />
            IA · recomendación
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-200">{text}</p>
          <p className="mt-1 text-[11px] text-zinc-500">{trainingIntensityHint}</p>
        </div>
      </div>
      <div className="relative mt-4 flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="border-violet-500/40 bg-violet-500/15 text-violet-100"
          onClick={() => toast.info("Sugerencias detalladas próximamente", { description: "Integración con el motor de planificación." })}
        >
          Ver sugerencias
        </Button>
      </div>
    </motion.div>
  );
}
