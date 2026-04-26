"use client";

import { Flame, Utensils } from "lucide-react";
import { useTrainingModuleStore } from "@/modules/training/stores/use-training-module-store";

export function TrainingModeToggle() {
  const trainingFocus = useTrainingModuleStore((s) => s.trainingFocus);
  const setTrainingFocus = useTrainingModuleStore((s) => s.setTrainingFocus);
  const setTrainingTab = useTrainingModuleStore((s) => s.setTrainingTab);

  return (
    <div className="flex max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <button
        type="button"
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
          trainingFocus === "training" ? "bg-violet-600/30 text-white shadow-lg shadow-violet-500/20" : "text-zinc-400 hover:text-white"
        }`}
        onClick={() => {
          setTrainingFocus("training");
          setTrainingTab("session");
        }}
      >
        <Flame className="h-4 w-4" />
        Entrenamiento
      </button>
      <button
        type="button"
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
          trainingFocus === "nutrition" ? "bg-emerald-500/20 text-white shadow-lg shadow-emerald-500/15" : "text-zinc-400 hover:text-white"
        }`}
        onClick={() => {
          setTrainingFocus("nutrition");
          setTrainingTab("nutrition");
        }}
      >
        <Utensils className="h-4 w-4" />
        Nutrición
      </button>
    </div>
  );
}
