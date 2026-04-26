"use client";

import { CreditCard, Dumbbell, Flame, MessageCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ProfileStats } from "@/modules/profile/components/profile-dynamic.types";

export function ProfileMetricsCard({ sessionsCount, paymentsCount, postsCount }: ProfileStats) {
  return (
    <Card className="space-y-2.5 border-[var(--border)] bg-[linear-gradient(180deg,rgba(16,30,44,0.96),rgba(9,15,27,0.97))] lg:col-span-3 lg:min-h-[252px] xl:min-h-[262px]">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <p className="text-sm font-medium text-white">Métricas</p>
        <button type="button" className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200">
          Ver todas
          <Sparkles className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between rounded-lg border border-cyan-300/10 bg-white/5 px-2.5 py-2">
          <span className="inline-flex items-center gap-2 text-[var(--muted)]">
            <Dumbbell className="h-4 w-4 text-emerald-300" />
            Sesiones
          </span>
          <span className="text-right">
            <span className="block font-semibold text-white">{sessionsCount}</span>
            <span className="block text-[10px] text-emerald-300">+25%</span>
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-violet-300/10 bg-white/5 px-2.5 py-2">
          <span className="inline-flex items-center gap-2 text-[var(--muted)]">
            <CreditCard className="h-4 w-4 text-violet-300" />
            Pagos
          </span>
          <span className="text-right">
            <span className="block font-semibold text-white">{paymentsCount}</span>
            <span className="block text-[10px] text-emerald-300">+100%</span>
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
          <span className="inline-flex items-center gap-2 text-[var(--muted)]">
            <MessageCircle className="h-4 w-4 text-cyan-300" />
            Posts
          </span>
          <span className="font-semibold text-white">{postsCount}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
          <span className="inline-flex items-center gap-2 text-[var(--muted)]">
            <Flame className="h-4 w-4 text-amber-300" />
            Tiempo entrenando
          </span>
          <span className="font-semibold text-white">{sessionsCount * 45}m</span>
        </div>
      </div>
    </Card>
  );
}
