"use client";

import { CalendarDays, MapPin, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ProfileHeaderMeta } from "@/modules/profile/components/profile-dynamic.types";

export function ProfileDynamicHeader({
  profile,
  role,
  profileInitials,
  sessionsCount,
  postsCount,
  streakDays,
  onEdit,
  userEmail,
}: ProfileHeaderMeta) {
  return (
    <Card className="relative overflow-hidden border-[var(--border)] bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.22),transparent_38%),radial-gradient(circle_at_top_left,rgba(139,92,246,0.22),transparent_38%),var(--surface)] p-0 lg:col-span-9">
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="relative p-4 md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-3">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-cyan-300/40 bg-zinc-900 text-base font-semibold text-white shadow-[0_0_22px_rgba(34,211,238,0.35)]">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt="avatar perfil" className="h-full w-full rounded-full object-cover" />
              ) : (
                profileInitials
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                  {role}
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-cyan-200/80">Perfil dinámico</span>
              </div>
              <p className="mt-1.5 text-xl font-semibold text-white">{profile.name}</p>
              <p className="text-xs text-[var(--muted)]">{profile.email || userEmail}</p>
              <p className="mt-1.5 max-w-2xl text-xs text-[var(--muted)]">{profile.bio}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-[11px] text-[var(--muted)]">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                  Downtown
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-cyan-300" />
                  Miembro desde 03/2024
                </span>
                <span className="rounded-full border border-violet-300/30 bg-violet-400/10 px-2 py-0.5 text-violet-200">
                  Nivel {Math.max(1, Math.min(10, sessionsCount))}
                </span>
              </div>
            </div>
          </div>
          <div className="grid w-full gap-2 sm:grid-cols-5 xl:max-w-2xl">
            {[
              { label: "Seguidores", value: sessionsCount * 16 },
              { label: "Siguiendo", value: Math.max(12, postsCount * 2) },
              { label: "Logros", value: Math.max(2, Math.round((sessionsCount + postsCount) / 2)) },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                <p className="text-lg font-semibold text-white">{item.value}</p>
                <p className="text-[11px] text-[var(--muted)]">{item.label}</p>
              </div>
            ))}
            <div className="sm:col-span-2 rounded-xl border border-cyan-300/25 bg-cyan-400/5 px-3 py-2.5">
              <div className="flex items-start justify-between">
                <p className="text-[11px] text-cyan-200/90">
                  Racha actual <span className="ml-1">🔥</span>
                </p>
                <p className="text-right">
                  <span className="block text-xl font-semibold text-white">{streakDays}</span>
                  <span className="block text-[10px] text-[var(--muted)]">días</span>
                </p>
              </div>
              <div className="mt-2 flex items-end gap-1.5">
                {[2, 5, 4, 7, 3, 6, 2].map((bar, index) => (
                  <span
                    key={`streak-bar-${index}`}
                    className="w-1.5 rounded-full bg-gradient-to-t from-cyan-500/45 to-emerald-300/90"
                    style={{ height: `${bar * 4}px` }}
                  />
                ))}
              </div>
              <p className="mt-1 text-[10px] tracking-[0.22em] text-[var(--muted)]">L M X J V S D</p>
            </div>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="absolute right-4 top-4" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
