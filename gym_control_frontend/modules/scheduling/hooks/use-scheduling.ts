import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useDeleteClass, useUpdateBooking } from "@/hooks/use-zudel-mutations";
import { useBookings, useClasses, useSchedule } from "@/hooks/use-zudel-query";
import { UX_TOAST } from "@/lib/ux-copy-dictionary";
import {
  useCreateClassWithSession,
  useMarkAttendance,
  useMoveClass,
  useReserveClass,
  useFlushSchedulingQueue,
  useSchedulingSyncStore,
} from "@/modules/scheduling/hooks/use-scheduling-optimistic";

export function useScheduling() {
  const scheduleQuery = useSchedule();
  const classesQuery = useClasses();
  const bookingsQuery = useBookings({ userId: null });
  const createClassWithSession = useCreateClassWithSession();
  const deleteClass = useDeleteClass();
  const updateBooking = useUpdateBooking();
  const moveClass = useMoveClass();
  const reserveClass = useReserveClass();
  const markAttendance = useMarkAttendance();
  const { flushQueue } = useFlushSchedulingQueue();
  const pendingSessionIds = useSchedulingSyncStore((state) => state.pendingSessionIds);

  useEffect(() => {
    void flushQueue();
    function onOnline() {
      void flushQueue();
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flushQueue]);

  const classNameById = new Map((classesQuery.data ?? []).map((klass) => [klass.id, klass.name]));
  const classCapacityById = new Map((classesQuery.data ?? []).map((klass) => [klass.id, Math.max(1, klass.capacity)]));
  const bookingCountBySessionId = new Map<string, number>();
  for (const booking of bookingsQuery.data ?? []) {
    if (booking.status !== "BOOKED") continue;
    bookingCountBySessionId.set(booking.sessionId, (bookingCountBySessionId.get(booking.sessionId) ?? 0) + 1);
  }
  const scheduleItems = (scheduleQuery.data ?? []).map((session) => {
    const classId = session.classId;
    const capacity = classId ? classCapacityById.get(classId) ?? 20 : 20;
    const booked = bookingCountBySessionId.get(session.id) ?? 0;
    return {
      ...session,
      title: classId ? classNameById.get(classId) ?? session.title : session.title,
      occupancy: Math.min(100, Math.round((booked / capacity) * 100)),
    };
  });
  const [form, setForm] = useState({
    name: "",
    description: "",
    capacity: "20",
  });
  const [closedClassIds, setClosedClassIds] = useState<string[]>([]);

  async function onCreateClass(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return;
    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
    await createClassWithSession.mutateAsync({
      name: form.name.trim(),
      description: form.description || undefined,
      capacity: Math.max(1, Number(form.capacity) || 1),
      startAtIso: startAt.toISOString(),
      endAtIso: endAt.toISOString(),
      tempClassId: `temp-class-${Date.now()}`,
      tempSessionId: `temp-session-${Date.now()}`,
    });
    setForm({ name: "", description: "", capacity: "20" });
  }

  async function closeClass(sessionId: string) {
    const session = scheduleItems.find((item) => item.id === sessionId);
    if (!session?.classId) {
      toast.error(UX_TOAST.classNotFoundToClose);
      return;
    }
    await deleteClass.mutateAsync({ classId: session.classId });
    setClosedClassIds((prev) => (prev.includes(sessionId) ? prev : [...prev, sessionId]));
    toast.success(UX_TOAST.classClosed);
  }

  async function startReschedule(sessionId: string, nextStartAt?: string, nextEndAt?: string) {
    const session = scheduleItems.find((item) => item.id === sessionId);
    if (!session) {
      toast.error(UX_TOAST.sessionNotFound);
      return;
    }

    const startAt = new Date(nextStartAt ?? session.startsAt);
    const endAt = new Date(nextEndAt ?? session.endsAt);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      toast.error(UX_TOAST.invalidSessionTime);
      return;
    }

    if (endAt.getTime() <= startAt.getTime()) {
      toast.error(UX_TOAST.invalidEndTime);
      return;
    }

    await moveClass.mutateAsync({
      sessionId: session.id,
      startTime: startAt.toISOString(),
      endTime: endAt.toISOString(),
    });
    toast.success(UX_TOAST.classRescheduled, { description: session.title });
  }

  async function cancelBookings(sessionId: string) {
    const targetBookings = (bookingsQuery.data ?? []).filter(
      (booking) => booking.sessionId === sessionId && booking.status === "BOOKED",
    );
    if (targetBookings.length === 0) {
      toast.message(UX_TOAST.noBookingsToCancel);
      return;
    }
    await Promise.all(
      targetBookings.map((booking) =>
        updateBooking.mutateAsync({
          bookingId: booking.id,
          status: "CANCELLED",
        }),
      ),
    );
    toast.success(UX_TOAST.bookingsCancelled, { description: `${targetBookings.length} reservas` });
  }

  async function createClassFromCell(payload: {
    name: string;
    description?: string;
    capacity: number;
    startAtIso: string;
    endAtIso: string;
  }) {
    if (!payload.name.trim()) {
      toast.error(UX_TOAST.classNameRequired);
      return;
    }
    const startAt = new Date(payload.startAtIso);
    const endAt = new Date(payload.endAtIso);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      toast.error(UX_TOAST.invalidScheduleTime);
      return;
    }
    if (endAt.getTime() <= startAt.getTime()) {
      toast.error(UX_TOAST.invalidEndTime);
      return;
    }
    const tempClassId = `temp-class-${Date.now()}`;
    const tempSessionId = `temp-session-${Date.now()}`;
    await createClassWithSession.mutateAsync({
      name: payload.name.trim(),
      description: payload.description?.trim() || undefined,
      capacity: Math.max(1, Number(payload.capacity) || 1),
      startAtIso: startAt.toISOString(),
      endAtIso: endAt.toISOString(),
      tempClassId,
      tempSessionId,
    });
    toast.success(UX_TOAST.classCreatedFromCell);
  }

  async function reserveSession(sessionId: string, userId: string) {
    await reserveClass.mutateAsync({
      sessionId,
      userId,
      tempBookingId: `temp-booking-${Date.now()}`,
    });
    toast.success(UX_TOAST.bookingSent);
  }

  async function markBookingAttendance(bookingId: string) {
    await markAttendance.mutateAsync({ bookingId });
    toast.success(UX_TOAST.attendanceUpdated);
  }

  return {
    classesQuery,
    createClassWithSession,
    scheduleItems,
    pendingSessionIds,
    form,
    setForm,
    closedClassIds,
    onCreateClass,
    closeClass,
    startReschedule,
    cancelBookings,
    createClassFromCell,
    reserveSession,
    markBookingAttendance,
    isMutatingSchedule:
      createClassWithSession.isPending ||
      deleteClass.isPending ||
      moveClass.isPending ||
      reserveClass.isPending ||
      markAttendance.isPending ||
      bookingsQuery.isFetching,
  };
}
