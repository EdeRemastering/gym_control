"use client";

import { ExternalLink, Lightbulb, ShieldAlert, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ExerciseContext } from "@/modules/training/types/training-module.types";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  context: ExerciseContext;
};

export function ExerciseTechniqueModal({ open, onOpenChange, exerciseName, context }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border border-white/10 bg-gradient-to-b from-[#101528] to-[#060912] p-0 text-white shadow-[0_0_60px_rgba(124,58,237,0.25)] sm:max-w-lg">
        <div className="border-b border-white/10 bg-white/[0.03] p-5">
          <DialogHeader>
            <DialogTitle className="text-left text-xl font-bold text-white">Técnica · {exerciseName}</DialogTitle>
            <p className="text-left text-sm text-zinc-400">Guía breve, consejos y errores a evitar.</p>
          </DialogHeader>
        </div>
        <div className="space-y-5 p-5">
          {context.mediaUrl ? (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={context.mediaUrl} alt="" className="h-40 w-full object-cover" />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-200">
              {context.muscleGroup}
            </span>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-violet-200">
              {context.objective} · {context.difficulty}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-200">
              <Sparkles className="h-4 w-4" />
              Cómo ejecutar
            </div>
            <p className="text-sm leading-relaxed text-zinc-300">{context.howTo}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
              <Lightbulb className="h-4 w-4" />
              Consejos
            </div>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-zinc-300">
              {context.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-rose-200">
              <ShieldAlert className="h-4 w-4" />
              Errores frecuentes
            </div>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-zinc-300">
              {context.mistakes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>

          {context.demoVideoUrl ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full border-white/10 bg-white/5"
              onClick={() => window.open(context.demoVideoUrl, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="h-4 w-4" />
              Buscar demostración en video
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
