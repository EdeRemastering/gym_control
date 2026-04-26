"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api/services";
import { useSessionStore } from "@/lib/session-store";
import { UX_TOAST } from "@/lib/ux-copy-dictionary";
import type { ClassSession, FitnessClass } from "@/lib/types";

type Booking = { id: string; sessionId: string; userId: string; status: string };
type SessionCtx = { token: string; gymId: string };
type SyncIntent =
  | { id: string; kind: "MOVE_SESSION"; payload: { sessionId: string; startTime: string; endTime: string } }
  | { id: string; kind: "RESERVE"; payload: { sessionId: string; userId: string } }
  | { id: string; kind: "ATTEND"; payload: { bookingId: string } };

type SyncStore = {
  pendingSessionIds: string[];
  pendingClassIds: string[];
  queuedActions: SyncIntent[];
  logs: string[];
  moveRevisionBySessionId: Record<string, number>;
  pendingSessionCountById: Record<string, number>;
  beginSessionSync: (sessionId: string) => void;
  endSessionSync: (sessionId: string) => void;
  addPendingClass: (classId: string) => void;
  removePendingClass: (classId: string) => void;
  nextMoveRevision: (sessionId: string) => number;
  getMoveRevision: (sessionId: string) => number;
  enqueueAction: (action: SyncIntent) => void;
  removeQueuedAction: (actionId: string) => void;
  addLog: (message: string) => void;
};

export const useSchedulingSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      pendingSessionIds: [],
      pendingClassIds: [],
      queuedActions: [],
      logs: [],
      moveRevisionBySessionId: {},
      pendingSessionCountById: {},
      beginSessionSync: (sessionId) =>
        set((state) => {
          const nextCount = (state.pendingSessionCountById[sessionId] ?? 0) + 1;
          const nextCounts = { ...state.pendingSessionCountById, [sessionId]: nextCount };
          const nextIds = Object.keys(nextCounts).filter((id) => (nextCounts[id] ?? 0) > 0);
          return { pendingSessionCountById: nextCounts, pendingSessionIds: nextIds };
        }),
      endSessionSync: (sessionId) =>
        set((state) => {
          const current = state.pendingSessionCountById[sessionId] ?? 0;
          const nextCount = Math.max(0, current - 1);
          const nextCounts = { ...state.pendingSessionCountById };
          if (nextCount === 0) {
            delete nextCounts[sessionId];
          } else {
            nextCounts[sessionId] = nextCount;
          }
          const nextIds = Object.keys(nextCounts).filter((id) => (nextCounts[id] ?? 0) > 0);
          return { pendingSessionCountById: nextCounts, pendingSessionIds: nextIds };
        }),
      addPendingClass: (classId) =>
        set((state) => ({
          pendingClassIds: state.pendingClassIds.includes(classId)
            ? state.pendingClassIds
            : [...state.pendingClassIds, classId],
        })),
      removePendingClass: (classId) =>
        set((state) => ({
          pendingClassIds: state.pendingClassIds.filter((id) => id !== classId),
        })),
      nextMoveRevision: (sessionId) => {
        const current = get().moveRevisionBySessionId[sessionId] ?? 0;
        const next = current + 1;
        set((state) => ({
          moveRevisionBySessionId: { ...state.moveRevisionBySessionId, [sessionId]: next },
        }));
        return next;
      },
      getMoveRevision: (sessionId) => get().moveRevisionBySessionId[sessionId] ?? 0,
      enqueueAction: (action) =>
        set((state) => ({
          queuedActions: [...state.queuedActions, action],
          logs: [...state.logs, `Encolada accion offline: ${action.id}`].slice(-100),
        })),
      removeQueuedAction: (actionId) =>
        set((state) => ({
          queuedActions: state.queuedActions.filter((action) => action.id !== actionId),
        })),
      addLog: (message) =>
        set((state) => ({
          logs: [...state.logs, message].slice(-100),
        })),
    }),
    {
      name: "scheduling-sync-store",
      partialize: (state) => ({
        queuedActions: state.queuedActions,
        logs: state.logs,
      }),
    },
  ),
);

function getSessionValues(): SessionCtx {
  const session = useSessionStore.getState();
  if (!session.accessToken || !session.user?.gymId) {
    throw new Error("Sesion no disponible");
  }
  return { token: session.accessToken, gymId: session.user.gymId };
}

function makeTempId(prefix: string) {
  return `temp-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 2, baseMs = 300): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      const delay = baseMs * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

function patchScheduleById(
  old: ClassSession[] | undefined,
  sessionId: string,
  patch: Partial<ClassSession>,
): ClassSession[] {
  return (old ?? []).map((session) => (session.id === sessionId ? { ...session, ...patch } : session));
}

export function useMoveClass() {
  const queryClient = useQueryClient();
  const syncStore = useSchedulingSyncStore.getState();

  return useMutation({
    mutationFn: async (payload: { sessionId: string; startTime: string; endTime: string }) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const actionId = `offline-move-${payload.sessionId}-${Date.now()}`;
        syncStore.enqueueAction({ id: actionId, kind: "MOVE_SESSION", payload });
        syncStore.addLog(`Offline move encolado: ${payload.sessionId}`);
        return { id: payload.sessionId, status: "QUEUED" };
      }
      const session = getSessionValues();
      return retryWithBackoff(() =>
        api.updateSession(session.gymId, session.token, payload.sessionId, {
          startTime: payload.startTime,
          endTime: payload.endTime,
        }),
      );
    },
    onMutate: async (payload) => {
      const session = getSessionValues();
      const queryKey = ["schedule", session.gymId] as const;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ClassSession[]>(queryKey);
      syncStore.beginSessionSync(payload.sessionId);
      const revision = syncStore.nextMoveRevision(payload.sessionId);
      syncStore.addLog(`onMutate move ${payload.sessionId}`);

      queryClient.setQueryData<ClassSession[]>(queryKey, (old) =>
        patchScheduleById(old, payload.sessionId, {
          startsAt: payload.startTime,
          endsAt: payload.endTime,
          isSyncing: true,
        }),
      );

      return { previous, queryKey, sessionId: payload.sessionId, revision };
    },
    onError: (_error, payload, context) => {
      const latestRevision = syncStore.getMoveRevision(payload.sessionId);
      const canRollback = context?.revision === latestRevision;
      if (context?.previous && canRollback) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
      syncStore.endSessionSync(payload.sessionId);
      syncStore.addLog(`rollback move ${payload.sessionId}`);
      toast.error(UX_TOAST.classMoveError);
    },
    onSuccess: (_result, payload, context) => {
      queryClient.setQueryData<ClassSession[]>(context.queryKey, (old = []) =>
        old.map((session) => (session.id === payload.sessionId ? { ...session, isSyncing: false } : session)),
      );
    },
    onSettled: (_result, _error, payload, context) => {
      syncStore.endSessionSync(payload.sessionId);
      syncStore.addLog(`onSettled move ${payload.sessionId}`);
      queryClient.invalidateQueries({ queryKey: context?.queryKey ?? ["schedule"] });
    },
  });
}

export function useCreateClassWithSession() {
  const queryClient = useQueryClient();
  const syncStore = useSchedulingSyncStore.getState();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description?: string;
      capacity: number;
      startAtIso: string;
      endAtIso: string;
      tempClassId: string;
      tempSessionId: string;
    }) => {
      const session = getSessionValues();
      const createdClass = await retryWithBackoff(() =>
        api.createClass(session.gymId, session.token, {
          name: payload.name,
          description: payload.description,
          capacity: payload.capacity,
        }),
      );
      const createdSession = await retryWithBackoff(() =>
        api.createSession(session.gymId, session.token, {
          classId: createdClass.id,
          date: payload.startAtIso,
          startTime: payload.startAtIso,
          endTime: payload.endAtIso,
        }),
      );
      return { createdClass, createdSession };
    },
    onMutate: async (payload) => {
      const session = getSessionValues();
      const classesKey = ["classes", session.gymId] as const;
      const scheduleKey = ["schedule", session.gymId] as const;
      await Promise.all([
        queryClient.cancelQueries({ queryKey: classesKey }),
        queryClient.cancelQueries({ queryKey: scheduleKey }),
      ]);

      const prevClasses = queryClient.getQueryData<FitnessClass[]>(classesKey);
      const prevSchedule = queryClient.getQueryData<ClassSession[]>(scheduleKey);
      syncStore.addPendingClass(payload.tempClassId);
      syncStore.beginSessionSync(payload.tempSessionId);
      syncStore.addLog(`onMutate create ${payload.tempClassId}`);

      queryClient.setQueryData<FitnessClass[]>(classesKey, (old = []) => [
        {
          id: payload.tempClassId,
          name: payload.name,
          description: payload.description ?? null,
          capacity: payload.capacity,
          trainerId: null,
          isSyncing: true,
        },
        ...old,
      ]);
      queryClient.setQueryData<ClassSession[]>(scheduleKey, (old = []) => [
        {
          id: payload.tempSessionId,
          classId: payload.tempClassId,
          title: payload.name,
          trainer: "Sin asignar",
          startsAt: payload.startAtIso,
          endsAt: payload.endAtIso,
          occupancy: 0,
          status: "SCHEDULED",
          isSyncing: true,
          isOptimistic: true,
        },
        ...old,
      ]);

      return { classesKey, scheduleKey, prevClasses, prevSchedule };
    },
    onError: (_error, payload, context) => {
      if (context?.prevClasses) queryClient.setQueryData(context.classesKey, context.prevClasses);
      if (context?.prevSchedule) queryClient.setQueryData(context.scheduleKey, context.prevSchedule);
      syncStore.removePendingClass(payload.tempClassId);
      syncStore.endSessionSync(payload.tempSessionId);
      syncStore.addLog(`rollback create ${payload.tempClassId}`);
      toast.error(UX_TOAST.classCreateError);
    },
    onSuccess: (result, payload, context) => {
      queryClient.setQueryData<FitnessClass[]>(context.classesKey, (old = []) =>
        old.map((item) =>
          item.id === payload.tempClassId ? { ...result.createdClass, isSyncing: false } : item,
        ),
      );
      queryClient.setQueryData<ClassSession[]>(context.scheduleKey, (old = []) =>
        old.map((item) =>
          item.id === payload.tempSessionId
            ? {
                id: result.createdSession.id,
                classId: result.createdClass.id,
                title: result.createdClass.name,
                trainer: "Sin asignar",
                startsAt: result.createdSession.startTime,
                endsAt: result.createdSession.endTime,
                occupancy: 0,
                status: "SCHEDULED",
                isSyncing: false,
              }
            : item,
        ),
      );
    },
    onSettled: (_result, _error, payload, context) => {
      syncStore.removePendingClass(payload.tempClassId);
      syncStore.endSessionSync(payload.tempSessionId);
      queryClient.invalidateQueries({ queryKey: context?.classesKey ?? ["classes"] });
      queryClient.invalidateQueries({ queryKey: context?.scheduleKey ?? ["schedule"] });
    },
  });
}

export function useReserveClass() {
  const queryClient = useQueryClient();
  const syncStore = useSchedulingSyncStore.getState();

  return useMutation({
    mutationFn: async (payload: { sessionId: string; userId: string; tempBookingId: string }) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const actionId = `offline-reserve-${payload.sessionId}-${payload.userId}-${Date.now()}`;
        syncStore.enqueueAction({
          id: actionId,
          kind: "RESERVE",
          payload: { sessionId: payload.sessionId, userId: payload.userId },
        });
        syncStore.addLog(`Offline reserve encolado: ${payload.sessionId}`);
        return { id: payload.tempBookingId, sessionId: payload.sessionId, userId: payload.userId, status: "BOOKED" };
      }
      const session = getSessionValues();
      return retryWithBackoff(() =>
        api.createBooking(session.gymId, session.token, {
          sessionId: payload.sessionId,
          userId: payload.userId,
        }),
      );
    },
    onMutate: async (payload) => {
      const session = getSessionValues();
      const queryKey = ["bookings", session.gymId] as const;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueriesData<Booking[]>({ queryKey: ["bookings", session.gymId] });
      syncStore.beginSessionSync(payload.sessionId);
      syncStore.addLog(`onMutate reserve ${payload.sessionId}`);

      queryClient.setQueriesData<Booking[]>({ queryKey: ["bookings", session.gymId] }, (old = []) => [
        { id: payload.tempBookingId, sessionId: payload.sessionId, userId: payload.userId, status: "BOOKED" },
        ...old,
      ]);

      return { previous, sessionId: payload.sessionId, tempBookingId: payload.tempBookingId };
    },
    onError: (_error, _payload, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context?.sessionId) syncStore.endSessionSync(context.sessionId);
      syncStore.addLog(`rollback reserve ${context?.sessionId ?? "unknown"}`);
      toast.error(UX_TOAST.bookingError);
    },
    onSuccess: (result, _payload, context) => {
      queryClient.setQueriesData<Booking[]>({ queryKey: ["bookings"] }, (old = []) =>
        old.map((booking) => (booking.id === context?.tempBookingId ? result : booking)),
      );
    },
    onSettled: (_result, _error, _payload, context) => {
      if (context?.sessionId) syncStore.endSessionSync(context.sessionId);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  const syncStore = useSchedulingSyncStore.getState();

  return useMutation({
    mutationFn: async (payload: { bookingId: string }) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const actionId = `offline-attend-${payload.bookingId}-${Date.now()}`;
        syncStore.enqueueAction({
          id: actionId,
          kind: "ATTEND",
          payload: { bookingId: payload.bookingId },
        });
        syncStore.addLog(`Offline attendance encolada: ${payload.bookingId}`);
        return { id: payload.bookingId, status: "ATTENDED" };
      }
      const session = getSessionValues();
      return retryWithBackoff(() =>
        api.updateBooking(session.gymId, session.token, payload.bookingId, { status: "ATTENDED" }),
      );
    },
    onMutate: async (payload) => {
      const session = getSessionValues();
      const queryKey = ["bookings", session.gymId] as const;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueriesData<Booking[]>({ queryKey: ["bookings", session.gymId] });

      queryClient.setQueriesData<Booking[]>({ queryKey: ["bookings", session.gymId] }, (old = []) =>
        old.map((booking) =>
          booking.id === payload.bookingId ? { ...booking, status: "ATTENDED" } : booking,
        ),
      );
      return { previous };
    },
    onError: (_error, _payload, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(UX_TOAST.attendanceError);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
}

export function useFlushSchedulingQueue() {
  const queuedActions = useSchedulingSyncStore((state) => state.queuedActions);
  const removeQueuedAction = useSchedulingSyncStore((state) => state.removeQueuedAction);
  const addLog = useSchedulingSyncStore((state) => state.addLog);
  const queryClient = useQueryClient();

  const flushQueue = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    const session = getSessionValues();
    for (const action of queuedActions) {
      try {
        if (action.kind === "MOVE_SESSION") {
          await retryWithBackoff(() =>
            api.updateSession(session.gymId, session.token, action.payload.sessionId, {
              startTime: action.payload.startTime,
              endTime: action.payload.endTime,
            }),
          );
        }
        if (action.kind === "RESERVE") {
          await retryWithBackoff(() =>
            api.createBooking(session.gymId, session.token, {
              sessionId: action.payload.sessionId,
              userId: action.payload.userId,
            }),
          );
        }
        if (action.kind === "ATTEND") {
          await retryWithBackoff(() =>
            api.updateBooking(session.gymId, session.token, action.payload.bookingId, {
              status: "ATTENDED",
            }),
          );
        }
        removeQueuedAction(action.id);
        addLog(`Procesada accion offline: ${action.id}`);
      } catch {
        addLog(`Fallo accion offline: ${action.id}`);
      }
    }
    queryClient.invalidateQueries({ queryKey: ["schedule"] });
    queryClient.invalidateQueries({ queryKey: ["bookings"] });
  }, [addLog, queryClient, queuedActions, removeQueuedAction]);

  return { flushQueue, queuedActions };
}
