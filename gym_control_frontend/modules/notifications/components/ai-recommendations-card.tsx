"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AIRecommendationsCard() {
  return (
    <Card className="space-y-3 border-violet-400/30 bg-[linear-gradient(180deg,rgba(42,16,72,0.45),rgba(9,18,43,0.8))]">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-fuchsia-300" />
        <p className="text-sm font-medium text-white">Recomendaciones IA</p>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Se detectaron 3 clientes en riesgo de cancelación. Recomendación: activar campaña personalizada.
      </p>
      <Button variant="ghost" size="sm" className="w-full">Ver clientes en riesgo</Button>
    </Card>
  );
}
