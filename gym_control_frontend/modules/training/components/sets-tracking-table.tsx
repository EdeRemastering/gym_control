"use client";

import { useEffect } from "react";
import { Check, Circle, Dot } from "lucide-react";
import { motion } from "framer-motion";
import { useTrainingModuleStore } from "@/modules/training/stores/use-training-module-store";

type Props = {
  exerciseId: string;
  targetSets: number;
  doneHere: number;
  defaultReps: number;
  defaultWeight: number;
};

function rowState(rowIndex: number, done: number) {
  if (rowIndex < done) return "done" as const;
  if (rowIndex === done) return "active" as const;
  return "upcoming" as const;
}

export function SetsTrackingTable({ exerciseId, targetSets, doneHere, defaultReps, defaultWeight }: Props) {
  const setRowDrafts = useTrainingModuleStore((s) => s.setRowDrafts);
  const setSetRowDrafts = useTrainingModuleStore((s) => s.setSetRowDrafts);

  useEffect(() => {
    setSetRowDrafts((prev) => {
      const out = prev.slice(0, targetSets);
      for (let i = 0; i < targetSets; i++) {
        if (!out[i]) {
          out[i] = { reps: String(defaultReps), weight: String(defaultWeight) };
        }
      }
      return out;
    });
  }, [exerciseId, targetSets, defaultReps, defaultWeight, setSetRowDrafts]);

  return (
    <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-600/5 via-transparent to-cyan-500/5"
        aria-hidden
      />
      <div className="relative">
        <div className="grid grid-cols-[minmax(0,0.4fr)_1fr_1fr_minmax(0,0.8fr)] gap-0 border-b border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 sm:px-4">
          <span>Serie</span>
          <span>Reps</span>
          <span>Peso (kg)</span>
          <span className="text-right">Estado</span>
        </div>
        {Array.from({ length: targetSets }, (_, i) => {
          const st = rowState(i, doneHere);
          const row = setRowDrafts[i] ?? { reps: String(defaultReps), weight: String(defaultWeight) };
          const isActive = st === "active";
          return (
            <div
              key={`${exerciseId}-set-${i}`}
              className={`grid grid-cols-[minmax(0,0.4fr)_1fr_1fr_minmax(0,0.8fr)] items-center gap-0 border-b border-white/5 px-2 py-2.5 sm:px-3 ${
                isActive ? "bg-gradient-to-r from-violet-600/15 to-cyan-500/10" : "bg-transparent"
              }`}
            >
              <div className="flex items-center justify-center sm:justify-start">
                {st === "done" ? (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20">
                    <Check className="h-3.5 w-3.5 text-emerald-200" />
                  </span>
                ) : isActive ? (
                  <span className="inline-flex h-7 w-7 items-center justify-center">
                    <Dot className="h-6 w-6 text-violet-300" />
                  </span>
                ) : (
                  <Circle className="h-3.5 w-3.5 text-zinc-600" />
                )}
                <span className="ml-1.5 text-sm font-semibold text-zinc-200">{i + 1}</span>
              </div>
              <div>
                {isActive ? (
                  <input
                    inputMode="numeric"
                    className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-white outline-none ring-cyan-500/30 focus:ring-2"
                    value={row.reps}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSetRowDrafts((prev) => {
                        const next = [...prev];
                        next[i] = { ...row, reps: v };
                        return next;
                      });
                    }}
                  />
                ) : (
                  <span className="text-sm text-zinc-400">{i < doneHere ? (setRowDrafts[i]?.reps ?? "—") : row.reps}</span>
                )}
              </div>
              <div>
                {isActive ? (
                  <input
                    inputMode="decimal"
                    className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-white outline-none ring-cyan-500/30 focus:ring-2"
                    value={row.weight}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSetRowDrafts((prev) => {
                        const next = [...prev];
                        next[i] = { ...row, weight: v };
                        return next;
                      });
                    }}
                  />
                ) : (
                  <span className="text-sm text-zinc-400">{i < doneHere ? (setRowDrafts[i]?.weight ?? "—") : row.weight}</span>
                )}
              </div>
              <div className="text-right text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                {st === "done" ? "Hecho" : isActive ? "Actual" : "Pendiente"}
              </div>
            </div>
          );
        })}
      </div>
      <motion.p
        key={exerciseId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border-t border-white/5 px-3 py-2 text-center text-[11px] text-zinc-500 sm:px-4"
      >
        Solo el set <span className="text-cyan-300/90">Actual</span> admite edición de reps y peso.
      </motion.p>
    </div>
  );
}
