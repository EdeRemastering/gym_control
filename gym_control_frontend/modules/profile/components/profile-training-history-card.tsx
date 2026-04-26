"use client";

import { Dot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type WorkoutItem = {
  id: string;
  status: string;
  startedAt: string;
};

type Props = {
  workouts: WorkoutItem[];
};

export function ProfileTrainingHistoryCard({ workouts }: Props) {
  return (
    <Card className="border-[var(--border)] bg-[linear-gradient(180deg,rgba(14,24,37,0.96),rgba(8,14,26,0.97))] lg:col-span-4 lg:min-h-[252px] xl:min-h-[262px]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">Historial de entrenamiento</p>
        <Button size="sm" variant="ghost">
          Ver todo
        </Button>
      </div>
      <div className="mt-3 space-y-1.5">
        {workouts.slice(0, 4).map((session) => (
          <div key={session.id} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-white">
            <p className="inline-flex items-center gap-1 text-xs uppercase tracking-wide text-emerald-300">
              <Dot className="-ml-1 h-4 w-4" />
              {session.status}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">{new Date(session.startedAt).toLocaleString()}</p>
          </div>
        ))}
        {workouts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--border)] bg-white/5 p-2 text-sm text-[var(--muted)]">
            Aún no tienes sesiones registradas.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
