"use client";

import type { LucideIcon } from "lucide-react";
import { Users } from "lucide-react";

type SocialMetric = {
  id: string;
  label: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
};

type LiveActivityItem = {
  id: string;
  userLabel: string;
  status: string;
  time: string;
};

type NextClassItem = {
  id: string;
  title: string;
  subtitle: string;
  spots: number;
};

type TopMemberItem = {
  id: string;
  rank: number;
  handle: string;
  score: number;
};

type SocialModuleSidebarProps = {
  metrics: SocialMetric[];
  liveActivity: LiveActivityItem[];
  nextClasses: NextClassItem[];
  topMembers: TopMemberItem[];
  isSchedulePending: boolean;
};

export function SocialModuleSidebar({
  metrics,
  liveActivity,
  nextClasses,
  topMembers,
  isSchedulePending,
}: SocialModuleSidebarProps) {
  return (
    <aside className="min-w-0 space-y-4 xl:sticky xl:top-28 xl:self-start">
      <div className="social-panel">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold tracking-[0.08em] text-white/95">METRICAS</p>
          <button type="button" className="text-xs text-white/55 hover:text-white">
            Ver todas
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.id} className="rounded-xl border border-white/[0.08] bg-black/25 p-3">
                <p className="inline-flex items-center gap-1.5 text-[11px] text-white/65">
                  <Icon className="h-3.5 w-3.5 text-secondary" />
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
                <p className="text-[11px] text-white/45">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>

      <div className="social-panel">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold tracking-[0.08em] text-white/95">ACTIVIDAD EN VIVO</p>
          <button type="button" className="text-xs text-white/55 hover:text-white">
            Ver todos
          </button>
        </div>
        <div className="space-y-2">
          {liveActivity.map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/25 p-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-xs font-semibold text-secondary">
                {item.userLabel.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{item.userLabel}</p>
                <p className="truncate text-xs text-emerald-300">{item.status}</p>
              </div>
              <span className="shrink-0 text-[11px] text-white/45">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="social-panel">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold tracking-[0.08em] text-white/95">PROXIMAS CLASES</p>
          <button type="button" className="text-xs text-white/55 hover:text-white">
            Ver agenda
          </button>
        </div>
        <div className="space-y-2">
          {nextClasses.length ? (
            nextClasses.slice(0, 1).map((item) => (
              <div key={item.id} className="rounded-xl border border-white/[0.08] bg-black/25 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-200">
                    {item.spots} cupos
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/55">{item.subtitle}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/55">{isSchedulePending ? "Cargando clases..." : "No hay clases programadas."}</p>
          )}
        </div>
      </div>

      <div className="social-panel">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold tracking-[0.08em] text-white/95">RETOS ACTIVOS</p>
          <button type="button" className="text-xs text-white/55 hover:text-white">
            Ver todos
          </button>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-black/25 p-3">
          <p className="text-sm font-semibold text-white">7 dias seguidos</p>
          <p className="text-xs text-white/55">Entrena 7 dias seguidos</p>
          <div className="mt-2 h-2 rounded-full bg-white/10">
            <div className="h-full w-[57%] rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400" />
          </div>
          <p className="mt-1 text-right text-xs text-white/60">4/7 dias</p>
        </div>
      </div>

      <div className="social-panel">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold tracking-[0.08em] text-white/95">TOP MIEMBROS</p>
          <button type="button" className="text-xs text-white/55 hover:text-white">
            Ver ranking
          </button>
        </div>
        <div className="space-y-2">
          {topMembers.length ? (
            topMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-black/25 p-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-xs font-semibold text-amber-300">#{member.rank}</span>
                  <span className="truncate text-sm font-medium text-white">{member.handle}</span>
                </div>
                <span className="text-xs text-orange-300">{member.score} pts</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/55">Sin ranking todavia.</p>
          )}
        </div>
      </div>
    </aside>
  );
}

