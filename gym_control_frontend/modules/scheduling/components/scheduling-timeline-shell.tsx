"use client";

import type { Dispatch, SetStateAction } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SchedulingTimelineBoard } from "@/modules/scheduling/components/timeline/scheduling-timeline-board";

type WeekDay = { key: string; day: string };
type ScheduleItem = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  trainer: string;
  occupancy: number;
  isSyncing?: boolean;
};

type SchedulingTimelineShellProps = {
  weekRangeLabel: string;
  setWeekStartUtc: (updater: (prev: Date) => Date) => void;
  weekDays: WeekDay[];
  hours: string[];
  eventsByCell: Map<string, ScheduleItem[]>;
  pendingSessionIds: string[];
  draggingSessionId: string | null;
  dragOverCell: string | null;
  setDragOverCell: Dispatch<SetStateAction<string | null>>;
  setDraggingSessionId: Dispatch<SetStateAction<string | null>>;
  onSelectSession: Dispatch<SetStateAction<string | null>>;
  onOpenCreateCell: (dayIndex: number, hourLabel: string) => void;
  onDropSession: (args: {
    sessionId: string;
    sourceStart: string;
    sourceEnd: string;
    dayIndex: number;
    hour: string;
  }) => Promise<void>;
  featuredClass?: ScheduleItem;
};

export function SchedulingTimelineShell({
  weekRangeLabel,
  setWeekStartUtc,
  weekDays,
  hours,
  eventsByCell,
  pendingSessionIds,
  draggingSessionId,
  dragOverCell,
  setDragOverCell,
  setDraggingSessionId,
  onSelectSession,
  onOpenCreateCell,
  onDropSession,
  featuredClass,
}: SchedulingTimelineShellProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-white/10 px-4 py-3 md:px-5">
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
              onClick={() =>
                setWeekStartUtc((prev) => {
                  const next = new Date(prev);
                  next.setUTCDate(prev.getUTCDate() - 7);
                  return next;
                })
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
              onClick={() =>
                setWeekStartUtc((prev) => {
                  const next = new Date(prev);
                  next.setUTCDate(prev.getUTCDate() + 7);
                  return next;
                })
              }
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="ml-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-sm font-semibold text-white">{weekRangeLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10">
              Semana
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-white">
            <CalendarDays className="h-4 w-4 text-[var(--primary)]" />
            <p className="text-base font-semibold">Timeline semanal interactiva</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Confirmada
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Pendiente
            </span>
            <span className="inline-flex items-center gap-1.5 text-rose-300">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              Cancelada
            </span>
          </div>
        </div>
        <p className="text-sm text-[var(--muted)]">Arrastra y suelta clases para reubicar en otros horarios.</p>

        <SchedulingTimelineBoard
          weekDays={weekDays}
          hours={hours}
          eventsByCell={eventsByCell}
          pendingSessionIds={pendingSessionIds}
          draggingSessionId={draggingSessionId}
          dragOverCell={dragOverCell}
          setDragOverCell={setDragOverCell}
          setDraggingSessionId={setDraggingSessionId}
          onSelectSession={onSelectSession}
          onOpenCreateCell={onOpenCreateCell}
          onDropSession={onDropSession}
        />

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{featuredClass?.id ?? "Sin sesión seleccionada"}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
                <span>Desde (UTC): {featuredClass?.startsAt ?? "--:--"}</span>
                <span>Hasta (UTC): {featuredClass?.endsAt ?? "--:--"}</span>
                <span>Coach asignado: {featuredClass?.trainer ?? "Sin asignar"}</span>
              </div>
            </div>
            <Button type="button" size="sm" variant="ghost">
              Ver detalles
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

