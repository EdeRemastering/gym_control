"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { toast } from "sonner";
import { api } from "@/lib/api/services";
import { useSessionStore } from "@/lib/session-store";
import { UX_TOAST } from "@/lib/ux-copy-dictionary";
import type { TrainingSet, WorkoutSession } from "@/lib/types";
import { useTrainingModuleStore } from "@/modules/training/stores/use-training-module-store";

type TrainingSyncStore = {
  pendingWorkoutIds: string[];
  startPendingWorkout: (id: string) => void;
  endPendingWorkout: (id: string) => void;
};

export const useTrainingSyncStore = create<TrainingSyncStore>((set) => ({
  pendingWorkoutIds: [],
  startPendingWorkout: (id) =>
    set((state) => ({
      pendingWorkoutIds: state.pendingWorkoutIds.includes(id) ? state.pendingWorkoutIds : [...state.pendingWorkoutIds, id],
    })),
  endPendingWorkout: (id) =>
    set((state) => ({
      pendingWorkoutIds: state.pendingWorkoutIds.filter((item) => item !== id),
    })),
}));

function getSessionValues() {
  const session = useSessionStore.getState();
  if (!session.accessToken || !session.user?.gymId) {
    throw new Error("Sesion no disponible");
  }
  return { token: session.accessToken, gymId: session.user.gymId };
}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 2, baseMs = 300): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, baseMs * 2 ** attempt));
    }
  }
  throw lastError;
}

export function useCreateWorkoutSessionOptimistic() {
  const queryClient = useQueryClient();
  const syncStore = useTrainingSyncStore.getState();

  return useMutation({
    mutationFn: async (payload: { userId: string; routineId: string; startedAt: string }) => {
      const session = getSessionValues();
      return retryWithBackoff(() => api.createWorkoutSession(session.gymId, session.token, payload));
    },
    onMutate: async (payload) => {
      const session = getSessionValues();
      const queryKey = ["workoutSessions", session.gymId, payload.userId] as const;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueriesData<WorkoutSession[]>({ queryKey: ["workoutSessions", session.gymId] });
      const tempId = `temp-workout-${Date.now()}`;
      syncStore.startPendingWorkout(tempId);
      queryClient.setQueriesData<WorkoutSession[]>({ queryKey: ["workoutSessions", session.gymId] }, (old = []) => [
        {
          id: tempId,
          userId: payload.userId,
          routineId: payload.routineId,
          startedAt: payload.startedAt,
          status: "ACTIVE",
        },
        ...old,
      ]);
      return { previous, tempId };
    },
    onError: (_error, _payload, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context?.tempId) syncStore.endPendingWorkout(context.tempId);
      toast.error(UX_TOAST.workoutStartError);
    },
    onSuccess: (result, _payload, context) => {
      queryClient.setQueriesData<WorkoutSession[]>({ queryKey: ["workoutSessions"] }, (old = []) =>
        old.map((session) => (session.id === context?.tempId ? result : session)),
      );
    },
    onSettled: (_result, _error, _payload, context) => {
      if (context?.tempId) syncStore.endPendingWorkout(context.tempId);
      queryClient.invalidateQueries({ queryKey: ["workoutSessions"] });
      queryClient.invalidateQueries({ queryKey: ["trainingLive"] });
    },
  });
}

export function useCreateExerciseLogOptimistic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { workoutSessionId: string; exerciseId: string; notes?: string }) => {
      const session = getSessionValues();
      return retryWithBackoff(() => api.createExerciseLog(session.gymId, session.token, payload));
    },
    onMutate: async () => {
      const previous = queryClient.getQueriesData<TrainingSet[]>({ queryKey: ["trainingLive"] });
      await queryClient.cancelQueries({ queryKey: ["trainingLive"] });
      queryClient.setQueriesData<TrainingSet[]>({ queryKey: ["trainingLive"] }, (old = []) => [
        { id: `temp-log-${Date.now()}`, exercise: "Ejercicio en sync...", reps: 0, weight: 0, done: false },
        ...old,
      ]);
      return { previous };
    },
    onError: (_error, _payload, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(UX_TOAST.exerciseRegisterError);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["trainingLive"] });
    },
  });
}

export type PersistWorkoutSetInput = {
  catalogExerciseId: string;
  reps: number;
  weight: number;
  restTimeSec: number;
};

/** Registra un set en el servidor: crea `exercise_log` la primera vez por ejercicio (catálogo) y luego `set_log`. */
export function usePersistWorkoutSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ catalogExerciseId, reps, weight, restTimeSec }: PersistWorkoutSetInput) => {
      const { activeWorkoutSessionId, exerciseLogIdByCatalogExerciseId, setExerciseLogIdForCatalog } =
        useTrainingModuleStore.getState();
      if (!activeWorkoutSessionId) return;
      const http = getSessionValues();
      let exerciseLogId = exerciseLogIdByCatalogExerciseId[catalogExerciseId];
      if (!exerciseLogId) {
        const log = await retryWithBackoff(() =>
          api.createExerciseLog(http.gymId, http.token, {
            workoutSessionId: activeWorkoutSessionId,
            exerciseId: catalogExerciseId,
          }),
        );
        exerciseLogId = log.id;
        setExerciseLogIdForCatalog(catalogExerciseId, exerciseLogId);
      }
      await retryWithBackoff(() =>
        api.createSetLog(http.gymId, http.token, {
          exerciseLogId,
          reps,
          weight,
          restTime: restTimeSec,
        }),
      );
    },
    onError: () => {
      toast.error(UX_TOAST.setSaveError);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workoutSessions"] });
      queryClient.invalidateQueries({ queryKey: ["trainingLive"] });
    },
  });
}

/** Cierra la sesión en el servidor (endedAt + COMPLETED) si hay `activeWorkoutSessionId`. */
export function useFinalizeWorkoutSessionOnServer() {
  const queryClient = useQueryClient();
  return async () => {
    const { activeWorkoutSessionId } = useTrainingModuleStore.getState();
    if (!activeWorkoutSessionId) return;
    try {
      const http = getSessionValues();
      await retryWithBackoff(() =>
        api.updateWorkoutSession(http.gymId, http.token, activeWorkoutSessionId, {
          endedAt: new Date().toISOString(),
          status: "COMPLETED",
        }),
      );
      queryClient.invalidateQueries({ queryKey: ["workoutSessions"] });
    } catch {
      toast.error(UX_TOAST.workoutCloseError);
    }
  };
}

