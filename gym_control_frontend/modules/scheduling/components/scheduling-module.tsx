"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { SchedulingSidebar } from "@/modules/scheduling/components/scheduling-sidebar";
import { SchedulingTimelineShell } from "@/modules/scheduling/components/scheduling-timeline-shell";
import type { ModuleShellProps } from "@/lib/module-shell-props";
import { EntityActionMenu } from "@/modules/action-system/components/entity-action-menu";
import { useScheduling } from "@/modules/scheduling/hooks/use-scheduling";
import { SchedulingRescheduleDialog } from "@/modules/scheduling/components/timeline/scheduling-reschedule-dialog";
import { SchedulingCreateCellDialog } from "@/modules/scheduling/components/timeline/scheduling-create-cell-dialog";
import { useSchedulingModuleUiStore } from "@/modules/scheduling/store/use-scheduling-module-ui-store";

function SchedulingModuleShell({ role }: ModuleShellProps) {
  const {
    scheduleItems,
    pendingSessionIds,
    closedClassIds,
    closeClass,
    startReschedule,
    cancelBookings,
    createClassFromCell,
    isMutatingSchedule,
  } = useScheduling();

  const weekDayLabels = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"] as const;
  const monthFormatter = new Intl.DateTimeFormat("es-CO", { month: "long" });
  const weekStartUtc = useSchedulingModuleUiStore((state) => state.weekStartUtc);
  const setWeekStartUtc = useSchedulingModuleUiStore((state) => state.setWeekStartUtc);
  const weekDays = useMemo(() => {
    return weekDayLabels.map((label, index) => {
      const date = new Date(weekStartUtc);
      date.setUTCDate(weekStartUtc.getUTCDate() + index);
      return {
        key: label,
        day: String(date.getUTCDate()).padStart(2, "0"),
      };
    });
  }, [weekStartUtc]);
  const weekRangeLabel = useMemo(() => {
    const weekEndUtc = new Date(weekStartUtc);
    weekEndUtc.setUTCDate(weekStartUtc.getUTCDate() + 6);
    const monthLabel = monthFormatter.format(weekEndUtc);
    return `${String(weekStartUtc.getUTCDate()).padStart(2, "0")} - ${String(weekEndUtc.getUTCDate()).padStart(
      2,
      "0",
    )} ${monthLabel}, ${weekEndUtc.getUTCFullYear()}`;
  }, [monthFormatter, weekStartUtc]);
  const hours = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
  const hourToRow = useMemo(() => {
    const map = new Map<number, string>();
    for (const hour of hours) {
      map.set(Number(hour.split(":")[0]), hour);
    }
    return map;
  }, [hours]);

  const visibleScheduleItems = useMemo(
    () => scheduleItems.filter((item) => !closedClassIds.includes(item.id)),
    [scheduleItems, closedClassIds],
  );
  const selectedClassId = useSchedulingModuleUiStore((state) => state.selectedClassId);
  const setSelectedClassId = useSchedulingModuleUiStore((state) => state.setSelectedClassId);
  const rescheduleSessionId = useSchedulingModuleUiStore((state) => state.rescheduleSessionId);
  const setRescheduleSessionId = useSchedulingModuleUiStore((state) => state.setRescheduleSessionId);
  const rescheduleStartAt = useSchedulingModuleUiStore((state) => state.rescheduleStartAt);
  const setRescheduleStartAt = useSchedulingModuleUiStore((state) => state.setRescheduleStartAt);
  const rescheduleEndAt = useSchedulingModuleUiStore((state) => state.rescheduleEndAt);
  const setRescheduleEndAt = useSchedulingModuleUiStore((state) => state.setRescheduleEndAt);
  const draggingSessionId = useSchedulingModuleUiStore((state) => state.draggingSessionId);
  const setDraggingSessionId = useSchedulingModuleUiStore((state) => state.setDraggingSessionId);
  const dragOverCell = useSchedulingModuleUiStore((state) => state.dragOverCell);
  const setDragOverCell = useSchedulingModuleUiStore((state) => state.setDragOverCell);
  const createCellKey = useSchedulingModuleUiStore((state) => state.createCellKey);
  const setCreateCellKey = useSchedulingModuleUiStore((state) => state.setCreateCellKey);
  const createCellDayIndex = useSchedulingModuleUiStore((state) => state.createCellDayIndex);
  const setCreateCellDayIndex = useSchedulingModuleUiStore((state) => state.setCreateCellDayIndex);
  const createCellHour = useSchedulingModuleUiStore((state) => state.createCellHour);
  const setCreateCellHour = useSchedulingModuleUiStore((state) => state.setCreateCellHour);
  const createCellName = useSchedulingModuleUiStore((state) => state.createCellName);
  const setCreateCellName = useSchedulingModuleUiStore((state) => state.setCreateCellName);
  const createCellDescription = useSchedulingModuleUiStore((state) => state.createCellDescription);
  const setCreateCellDescription = useSchedulingModuleUiStore((state) => state.setCreateCellDescription);
  const createCellCapacity = useSchedulingModuleUiStore((state) => state.createCellCapacity);
  const setCreateCellCapacity = useSchedulingModuleUiStore((state) => state.setCreateCellCapacity);
  const featuredClass = useMemo(
    () => visibleScheduleItems.find((item) => item.id === selectedClassId) ?? visibleScheduleItems[0],
    [selectedClassId, visibleScheduleItems],
  );
  const eventsByCell = useMemo(() => {
    const cellMap = new Map<string, typeof visibleScheduleItems>();
    const weekEndUtcExclusive = new Date(weekStartUtc);
    weekEndUtcExclusive.setUTCDate(weekStartUtc.getUTCDate() + 7);

    for (const item of visibleScheduleItems) {
      const date = new Date(item.startsAt);
      if (Number.isNaN(date.getTime())) continue;
      if (date < weekStartUtc || date >= weekEndUtcExclusive) continue;
      const dayIndex = Math.floor((date.getTime() - weekStartUtc.getTime()) / (24 * 60 * 60 * 1000));
      const hourNumber = date.getUTCHours();
      const hourLabel = hourToRow.get(hourNumber);
      if (dayIndex < 0 || dayIndex > 6 || !hourLabel) continue;
      const key = `${dayIndex}-${hourLabel}`;
      const current = cellMap.get(key) ?? [];
      cellMap.set(key, [...current, item]);
    }

    return cellMap;
  }, [visibleScheduleItems, hourToRow, weekStartUtc]);
  const sessionToReschedule = useMemo(
    () => visibleScheduleItems.find((item) => item.id === rescheduleSessionId) ?? null,
    [visibleScheduleItems, rescheduleSessionId],
  );

  function toDateTimeLocal(isoDate: string) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "";
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  }

  function toIsoFromDateTimeLocal(localDateTime: string) {
    const date = new Date(localDateTime);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  function openRescheduleDialog(sessionId: string) {
    const session = visibleScheduleItems.find((item) => item.id === sessionId);
    if (!session) return;
    setRescheduleSessionId(session.id);
    setRescheduleStartAt(toDateTimeLocal(session.startsAt));
    setRescheduleEndAt(toDateTimeLocal(session.endsAt));
  }

  function computeDroppedDateTime(baseIso: string, dayIndex: number, hourLabel: string) {
    if (!baseIso) return null;
    const monday = new Date(weekStartUtc);
    const [hour, minute] = hourLabel.split(":").map(Number);
    monday.setUTCDate(monday.getUTCDate() + dayIndex);
    monday.setUTCHours(hour ?? 0, minute ?? 0, 0, 0);
    return monday;
  }

  function computeCellDateTime(dayIndex: number, hourLabel: string) {
    const monday = new Date(weekStartUtc);
    const [hour, minute] = hourLabel.split(":").map(Number);
    monday.setUTCDate(monday.getUTCDate() + dayIndex);
    monday.setUTCHours(hour ?? 0, minute ?? 0, 0, 0);
    return monday;
  }

  function openCreateCellDialog(dayIndex: number, hourLabel: string) {
    setCreateCellKey(`${dayIndex}-${hourLabel}`);
    setCreateCellDayIndex(dayIndex);
    setCreateCellHour(hourLabel);
    setCreateCellName("");
    setCreateCellDescription("");
    setCreateCellCapacity("20");
  }
  function moveTimelineToWeekFromIso(isoDate: string) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return;
    const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const mondayOffset = (monday.getUTCDay() + 6) % 7;
    monday.setUTCDate(monday.getUTCDate() - mondayOffset);
    setWeekStartUtc(monday);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <SchedulingTimelineShell
          weekRangeLabel={weekRangeLabel}
          setWeekStartUtc={setWeekStartUtc}
          weekDays={weekDays}
          hours={hours}
          eventsByCell={eventsByCell}
          pendingSessionIds={pendingSessionIds}
          draggingSessionId={draggingSessionId}
          dragOverCell={dragOverCell}
          setDragOverCell={setDragOverCell}
          setDraggingSessionId={setDraggingSessionId}
          onSelectSession={setSelectedClassId}
          onOpenCreateCell={openCreateCellDialog}
          onDropSession={async ({ sessionId, sourceStart, sourceEnd, dayIndex, hour }) => {
            const startDate = computeDroppedDateTime(sourceStart, dayIndex, hour);
            if (!startDate) return;
            const sourceStartDate = new Date(sourceStart);
            const sourceEndDate = new Date(sourceEnd);
            const durationMs = sourceEndDate.getTime() - sourceStartDate.getTime();
            if (!Number.isFinite(durationMs) || durationMs <= 0) return;
            const endDate = new Date(startDate.getTime() + durationMs);
            await startReschedule(sessionId, startDate.toISOString(), endDate.toISOString());
          }}
          featuredClass={featuredClass}
        />

        <Card>
          <p className="text-sm text-[var(--muted)]">Clases programadas</p>
          <div className="mt-3 space-y-2">
            {visibleScheduleItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white/5 p-3">
                <div>
                  <p className="text-sm text-white">{item.title}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {item.startsAt} - {item.endsAt} | Coach {item.trainer}
                  </p>
                </div>
                <div className="max-w-sm">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      item.occupancy >= 80
                        ? "bg-emerald-500/20 text-emerald-200"
                        : item.occupancy >= 50
                          ? "bg-indigo-500/20 text-indigo-200"
                          : "bg-gray-500/20 text-gray-200"
                    }`}
                  >
                    {item.occupancy}% ocupado
                  </span>
                  {item.isSyncing || pendingSessionIds.includes(item.id) ? (
                    <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-200">
                      Sincronizando...
                    </span>
                  ) : null}
                  <EntityActionMenu
                    title="Clase"
                    actions={[
                      {
                        id: `close-${item.id}`,
                        label: "Cerrar clase",
                        kind: "state",
                        run: () => closeClass(item.id),
                      },
                      {
                        id: `reschedule-${item.id}`,
                        label: "Reprogramar",
                        kind: "flow",
                        run: () => openRescheduleDialog(item.id),
                      },
                      {
                        id: `cancel-booking-${item.id}`,
                        label: "Cancelar reservas",
                        kind: "bulk",
                        run: () => cancelBookings(item.id),
                      },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SchedulingSidebar role={role} featuredClass={featuredClass ?? null} onCreatedRecurringClass={moveTimelineToWeekFromIso} />

      <SchedulingRescheduleDialog
        open={Boolean(rescheduleSessionId)}
        session={sessionToReschedule}
        startAt={rescheduleStartAt}
        endAt={rescheduleEndAt}
        isLoading={isMutatingSchedule}
        onStartAtChange={setRescheduleStartAt}
        onEndAtChange={setRescheduleEndAt}
        onClose={() => {
          setRescheduleSessionId(null);
          setRescheduleStartAt("");
          setRescheduleEndAt("");
        }}
        onSave={async () => {
          if (!rescheduleSessionId || !rescheduleStartAt || !rescheduleEndAt) return;
          await startReschedule(
            rescheduleSessionId,
            toIsoFromDateTimeLocal(rescheduleStartAt),
            toIsoFromDateTimeLocal(rescheduleEndAt),
          );
          setRescheduleSessionId(null);
          setRescheduleStartAt("");
          setRescheduleEndAt("");
        }}
      />

      <SchedulingCreateCellDialog
        open={Boolean(createCellKey)}
        weekDays={weekDays}
        dayIndex={createCellDayIndex}
        hour={createCellHour}
        name={createCellName}
        description={createCellDescription}
        capacity={createCellCapacity}
        isLoading={isMutatingSchedule}
        onNameChange={setCreateCellName}
        onDescriptionChange={setCreateCellDescription}
        onCapacityChange={setCreateCellCapacity}
        onClose={() => setCreateCellKey(null)}
        onSave={async () => {
          const start = computeCellDateTime(createCellDayIndex, createCellHour);
          const end = new Date(start.getTime() + 60 * 60 * 1000);
          await createClassFromCell({
            name: createCellName,
            description: createCellDescription,
            capacity: Number(createCellCapacity) || 20,
            startAtIso: start.toISOString(),
            endAtIso: end.toISOString(),
          });
          setCreateCellKey(null);
        }}
      />
    </div>
  );
}

export function SchedulingModule(props: ModuleShellProps) {
  return <SchedulingModuleShell {...props} />;
}
