"use client";

import type { ClassSession } from "@/lib/types";
import type { WeekDay } from "@/modules/scheduling/components/timeline/types";

type SchedulingTimelineBoardProps = {
  weekDays: WeekDay[];
  hours: string[];
  eventsByCell: Map<string, ClassSession[]>;
  pendingSessionIds: string[];
  draggingSessionId: string | null;
  dragOverCell: string | null;
  setDragOverCell: (value: string | null) => void;
  setDraggingSessionId: (value: string | null) => void;
  onSelectSession: (sessionId: string) => void;
  onDropSession: (payload: { sessionId: string; sourceStart: string; sourceEnd: string; dayIndex: number; hour: string }) => Promise<void>;
  onOpenCreateCell: (dayIndex: number, hour: string) => void;
};

export function SchedulingTimelineBoard({
  weekDays,
  hours,
  eventsByCell,
  pendingSessionIds,
  draggingSessionId,
  dragOverCell,
  setDragOverCell,
  setDraggingSessionId,
  onSelectSession,
  onDropSession,
  onOpenCreateCell,
}: SchedulingTimelineBoardProps) {
  const mobileDaySections = weekDays.map((day, dayIndex) => {
    const events = hours.flatMap((hour) => {
      const cellKey = `${dayIndex}-${hour}`;
      return (eventsByCell.get(cellKey) ?? []).map((event) => ({ hour, event }));
    });
    return { day, dayIndex, events };
  });

  return (
    <div className="mt-4">
      <div className="space-y-3 md:hidden">
        {mobileDaySections.map(({ day, dayIndex, events }) => (
          <section key={`mobile-day-${day.key}-${day.day}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">
                {day.key} {day.day}
              </p>
              <button
                type="button"
                className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white transition hover:bg-white/10"
                onClick={() => onOpenCreateCell(dayIndex, hours[0] ?? "06:00")}
              >
                Crear clase
              </button>
            </div>
            {events.length ? (
              <div className="space-y-2">
                {events.map(({ hour, event }) => (
                  <div
                    key={`mobile-event-${event.id}-${hour}`}
                    className={`rounded-lg border px-3 py-2 ${
                      event.isSyncing || pendingSessionIds.includes(event.id)
                        ? "border-amber-400/60 bg-amber-500/20"
                        : "border-cyan-400/40 bg-cyan-500/20"
                    }`}
                  >
                    <p className="text-xs text-white/70">{hour}</p>
                    <p className="truncate text-sm font-semibold text-white">{event.title}</p>
                    <button
                      type="button"
                      className="mt-1 text-xs font-medium text-cyan-100 underline-offset-2 hover:underline"
                      onClick={() => onSelectSession(event.id)}
                    >
                      Ver detalles
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)]">Sin clases este día.</p>
            )}
          </section>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <div className="relative min-w-[720px] lg:min-w-[860px] rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(5,12,28,0.85),rgba(4,10,24,0.7))] p-3">
          <div className="grid grid-cols-[64px_repeat(7,minmax(96px,1fr))] gap-2 border-b border-white/10 pb-3">
            <div />
            {weekDays.map((col) => (
              <div key={col.key} className="text-center">
                <p className="text-[11px] text-[var(--muted)]">{col.key}</p>
                <p className="text-lg font-semibold text-white">{col.day}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-2">
            <div className="grid grid-cols-[64px_repeat(7,minmax(96px,1fr))] gap-2">
              {hours.map((hour) => (
                <div key={`h-${hour}`} className="contents">
                  <div className="h-12 pt-1 text-xs text-[var(--muted)]">{hour}</div>
                  {weekDays.map((day, dayIndex) => {
                    const cellKey = `${dayIndex}-${hour}`;
                    const cellEvents = eventsByCell.get(cellKey) ?? [];
                    return (
                      <div
                        key={`${day.key}-${hour}`}
                        className={`relative h-12 rounded-md border bg-white/[0.01] transition ${
                          dragOverCell === cellKey ? "border-[var(--primary)]/70 ring-1 ring-[var(--primary)]/35" : "border-white/[0.05]"
                        }`}
                        onDragOver={(event) => {
                          event.preventDefault();
                          if (!draggingSessionId) return;
                          setDragOverCell(cellKey);
                        }}
                        onDragLeave={() => {
                          if (dragOverCell === cellKey) setDragOverCell(null);
                        }}
                        onDrop={async (event) => {
                          event.preventDefault();
                          const sessionId = event.dataTransfer.getData("text/session-id");
                          const sourceStart = event.dataTransfer.getData("text/session-start");
                          const sourceEnd = event.dataTransfer.getData("text/session-end");
                          setDragOverCell(null);
                          setDraggingSessionId(null);
                          if (!sessionId || !sourceStart || !sourceEnd) return;
                          await onDropSession({ sessionId, sourceStart, sourceEnd, dayIndex, hour });
                        }}
                        onClick={() => {
                          if (cellEvents.length > 0 || draggingSessionId) return;
                          onOpenCreateCell(dayIndex, hour);
                        }}
                      >
                        {cellEvents.slice(0, 1).map((item) => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(event) => {
                              event.dataTransfer.setData("text/session-id", item.id);
                              event.dataTransfer.setData("text/session-start", item.startsAt);
                              event.dataTransfer.setData("text/session-end", item.endsAt);
                              event.dataTransfer.effectAllowed = "move";
                              setDraggingSessionId(item.id);
                            }}
                            onDragEnd={() => {
                              setDraggingSessionId(null);
                              setDragOverCell(null);
                            }}
                            className={`absolute inset-1 cursor-grab overflow-hidden rounded-xl border border-cyan-400/40 bg-cyan-500/25 px-2 py-1 active:cursor-grabbing ${
                              draggingSessionId === item.id ? "opacity-70" : ""
                            } ${
                              item.isSyncing || pendingSessionIds.includes(item.id)
                                ? "animate-pulse border-amber-400/60 bg-amber-500/20"
                                : ""
                            }`}
                          >
                            <p className="truncate text-xs font-semibold text-white">{item.title}</p>
                            {item.isSyncing || pendingSessionIds.includes(item.id) ? (
                              <p className="text-[10px] text-amber-100">Sync...</p>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => onSelectSession(item.id)}
                              className="mt-0.5 inline-flex text-[10px] font-medium text-white/85 underline-offset-2 transition hover:text-white hover:underline"
                            >
                              Detalles
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute left-[64px] right-0 top-[53%] border-t border-dashed border-rose-400/80">
              <span className="absolute -left-11 -top-3 rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                11:15
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
