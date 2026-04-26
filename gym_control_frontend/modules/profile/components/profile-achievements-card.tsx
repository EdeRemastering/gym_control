"use client";

import { CalendarDays, Flame, Heart, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ProfileAchievementsCard() {
  return (
    <Card className="border-[var(--border)] bg-[linear-gradient(180deg,rgba(14,24,37,0.96),rgba(8,14,26,0.97))] lg:col-span-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">Logros recientes</p>
        <button type="button" className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200">
          Ver todos
          <Trophy className="h-4 w-4 text-violet-300" />
        </button>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {[
          { title: "Primer PR", subtitle: "Completaste tu primera rutina", icon: Trophy },
          { title: "7 días", subtitle: "Entrena 7 días", icon: CalendarDays },
          { title: "Constante", subtitle: "5 días seguidos", icon: Flame },
          { title: "Dedicación", subtitle: "10 horas totales", icon: Heart },
        ].map((achievement) => {
          const Icon = achievement.icon;
          return (
            <div key={achievement.title} className="rounded-xl border border-violet-300/15 bg-white/5 px-2.5 py-2">
              <Icon className="h-4 w-4 text-cyan-300" />
              <p className="mt-1.5 text-sm font-medium text-white">{achievement.title}</p>
              <p className="text-[11px] text-[var(--muted)]">{achievement.subtitle}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
