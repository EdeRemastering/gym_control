"use client";

import { Dumbbell, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import { useTrainingStore } from "@/modules/training/store/use-training-store";
import { cn } from "@/lib/utils";

export function TrainingNutritionTabs() {
  const trainingTab = useTrainingStore((s) => s.trainingTab);
  const setTrainingTab = useTrainingStore((s) => s.setTrainingTab);

  return (
    <div className="border-b border-white/10 bg-[#090d16]/95 px-3 py-2 backdrop-blur-xl md:px-6">
      <div className="mx-auto max-w-[1600px]">
        <div className="relative grid grid-cols-2 gap-0 rounded-2xl border border-white/10 bg-black/40 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 via-transparent to-violet-500/5" />
          <button
            type="button"
            onClick={() => setTrainingTab("session")}
            className={cn(
              "relative flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-sm font-semibold transition",
              trainingTab === "session" ? "text-white" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {trainingTab === "session" ? <span className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-cyan-500/20 to-violet-600/15" /> : null}
            {trainingTab === "session" ? (
              <motion.span
                layoutId="training-tab-indicator"
                className="absolute bottom-0 left-1/2 h-0.5 w-14 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
              />
            ) : null}
            <Dumbbell className="h-4 w-4" />
            Entrenamiento
          </button>
          <button
            type="button"
            onClick={() => setTrainingTab("nutrition")}
            className={cn(
              "relative flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-sm font-semibold transition",
              trainingTab === "nutrition" ? "text-white" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {trainingTab === "nutrition" ? <span className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-violet-600/20 to-fuchsia-600/15" /> : null}
            {trainingTab === "nutrition" ? (
              <motion.span
                layoutId="training-tab-indicator"
                className="absolute bottom-0 left-1/2 h-0.5 w-14 -translate-x-1/2 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.4)]"
              />
            ) : null}
            <Utensils className="h-4 w-4" />
            Nutrición
          </button>
        </div>
        <div className="mt-2 flex justify-center gap-6 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
          <span className={trainingTab === "session" ? "text-cyan-400/90" : ""}>Foco en sesión</span>
          <span className="h-1 w-px bg-white/10" />
          <span className={trainingTab === "nutrition" ? "text-violet-300/90" : ""}>Plan de comida</span>
        </div>
      </div>
    </div>
  );
}
