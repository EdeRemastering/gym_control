import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { api } from "@/lib/api/services";
import { useSessionStore } from "@/lib/session-store";
import type {
  Checkin,
  FitnessClass,
  NotificationItem,
  NotificationPreferences,
  Payment,
  Plan,
  Routine,
  SocialPost,
  UserActivity,
  User,
  WorkoutSession,
} from "@/lib/types";

function getSessionValues() {
  const session = useSessionStore.getState();
  if (!session.accessToken || !session.user?.gymId) {
    throw new Error("Sesion no disponible");
  }
  return { token: session.accessToken, gymId: session.user.gymId };
}

type MutationContext = {
  snapshots: Array<{ queryKey: QueryKey; data: unknown }>;
  lockKey: string;
};

const mutationLocks = new Set<string>();

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function useOptimisticGymMutation<TPayload, TResult>(config: {
  lockKey: (payload: TPayload) => string;
  affectedQueryKeys: (session: { token: string; gymId: string }, payload: TPayload) => QueryKey[];
  mutationFn: (session: { token: string; gymId: string }, payload: TPayload) => Promise<TResult>;
  optimisticUpdate?: (
    queryClient: ReturnType<typeof useQueryClient>,
    session: { token: string; gymId: string },
    payload: TPayload,
  ) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation<TResult, Error, TPayload, MutationContext>({
    mutationFn: async (payload) => {
      const lockKey = config.lockKey(payload);
      if (mutationLocks.has(lockKey)) throw new Error("Accion en curso");
      mutationLocks.add(lockKey);
      return config.mutationFn(getSessionValues(), payload);
    },
    onMutate: async (payload) => {
      const session = getSessionValues();
      const affected = config.affectedQueryKeys(session, payload);
      await Promise.all(affected.map((queryKey) => queryClient.cancelQueries({ queryKey })));
      const snapshots = affected.flatMap((queryKey) =>
        queryClient.getQueriesData({ queryKey }).map(([storedKey, data]) => ({
          queryKey: storedKey,
          data,
        })),
      );
      config.optimisticUpdate?.(queryClient, session, payload);
      return { snapshots, lockKey: config.lockKey(payload) };
    },
    onError: (_error, _payload, context) => {
      context?.snapshots.forEach((snapshot) => {
        queryClient.setQueryData(snapshot.queryKey, snapshot.data);
      });
    },
    onSettled: (_result, _error, payload, context) => {
      mutationLocks.delete(context?.lockKey ?? config.lockKey(payload));
      const session = getSessionValues();
      config
        .affectedQueryKeys(session, payload)
        .forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
  });
}

export function useCreateUser() {
  return useOptimisticGymMutation({
    lockKey: () => "users:create",
    affectedQueryKeys: (session) => [["users", session.gymId]],
    mutationFn: (session, payload: { name: string; email?: string; phone?: string; bio?: string }) =>
      api.createUser(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      const optimisticUser: User = {
        id: makeId("usr"),
        name: payload.name,
        email: payload.email ?? "",
        phone: payload.phone ?? null,
        bio: payload.bio ?? null,
      };
      queryClient.setQueriesData<User[]>({ queryKey: ["users"] }, (old = []) => [
        optimisticUser,
        ...old,
      ]);
    },
  });
}

export function useUpdateUser() {
  return useOptimisticGymMutation({
    lockKey: (payload: { userId: string }) => `users:update:${payload.userId}`,
    affectedQueryKeys: (session) => [["users", session.gymId]],
    mutationFn: (
      session,
      payload: { userId: string; data: { name?: string; email?: string; phone?: string; bio?: string } },
    ) => api.updateUser(session.gymId, payload.userId, session.token, payload.data),
    optimisticUpdate: (queryClient, _session, payload) => {
      queryClient.setQueriesData<User[]>({ queryKey: ["users"] }, (old = []) =>
        old.map((user) => (user.id === payload.userId ? { ...user, ...payload.data } : user)),
      );
    },
  });
}

export function useCreatePlan() {
  return useOptimisticGymMutation({
    lockKey: () => "plans:create",
    affectedQueryKeys: (session) => [["plans", session.gymId]],
    mutationFn: (session, payload: { name: string; duration: number; price: number }) =>
      api.createPlan(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      const optimisticPlan: Plan = { id: makeId("plan"), ...payload };
      queryClient.setQueriesData<Plan[]>({ queryKey: ["plans"] }, (old = []) => [optimisticPlan, ...old]);
    },
  });
}

export function useCreatePayment() {
  return useOptimisticGymMutation({
    lockKey: (payload: { userId: string }) => `payments:create:${payload.userId}`,
    affectedQueryKeys: (session) => [["payments", session.gymId], ["revenue", session.gymId]],
    mutationFn: (
      session,
      payload: {
        userId: string;
        membershipId?: string;
        discountId?: string;
        method: "CASH" | "CARD" | "TRANSFER" | "ONLINE";
        amount: number;
        finalAmount: number;
        status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
        notes?: string;
      },
    ) => api.createPayment(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      const optimisticPayment: Payment = {
        id: makeId("pay"),
        userId: payload.userId,
        status: payload.status ?? "COMPLETED",
        method: payload.method,
        finalAmount: payload.finalAmount,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueriesData<Payment[]>({ queryKey: ["payments"] }, (old = []) => [
        optimisticPayment,
        ...old,
      ]);
    },
  });
}

export function useCreateMembership() {
  return useOptimisticGymMutation({
    lockKey: (payload: { userId: string; planId: string }) =>
      `memberships:create:${payload.userId}:${payload.planId}`,
    affectedQueryKeys: (session) => [["memberships", session.gymId]],
    mutationFn: (
      session,
      payload: {
        planId: string;
        userId: string;
        startDate: string;
        endDate: string;
        status?: "ACTIVE" | "INACTIVE" | "EXPIRED" | "CANCELLED" | "SUSPENDED";
      },
    ) => api.createMembership(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      queryClient.setQueriesData<Array<{ id: string; status: string }>>(
        { queryKey: ["memberships"] },
        (old = []) => [{ id: makeId("mbs"), status: payload.status ?? "ACTIVE" }, ...old],
      );
    },
  });
}

export function useCreateClass() {
  return useOptimisticGymMutation({
    lockKey: () => "classes:create",
    affectedQueryKeys: (session) => [["classes", session.gymId], ["schedule", session.gymId]],
    mutationFn: (
      session,
      payload: { name: string; description?: string; trainerId?: string; capacity: number },
    ) => api.createClass(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      const optimisticClass: FitnessClass = {
        id: makeId("class"),
        name: payload.name,
        description: payload.description ?? null,
        trainerId: payload.trainerId ?? null,
        capacity: payload.capacity,
      };
      queryClient.setQueriesData<FitnessClass[]>({ queryKey: ["classes"] }, (old = []) => [
        optimisticClass,
        ...old,
      ]);
    },
  });
}

export function useCreateBooking() {
  return useOptimisticGymMutation({
    lockKey: (payload: { sessionId: string; userId: string }) =>
      `bookings:create:${payload.sessionId}:${payload.userId}`,
    affectedQueryKeys: (session) => [["bookings", session.gymId]],
    mutationFn: (session, payload: { sessionId: string; userId: string }) =>
      api.createBooking(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      queryClient.setQueriesData<Array<{ id: string; sessionId: string; userId: string; status: string }>>(
        { queryKey: ["bookings"] },
        (old = []) => [{ id: makeId("bkg"), ...payload, status: "BOOKED" }, ...old],
      );
    },
  });
}

export function useUpdateBooking() {
  return useOptimisticGymMutation({
    lockKey: (payload: { bookingId: string }) => `bookings:update:${payload.bookingId}`,
    affectedQueryKeys: (session) => [["bookings", session.gymId]],
    mutationFn: (session, payload: { bookingId: string; status: "BOOKED" | "CANCELLED" | "ATTENDED" | "NO_SHOW" }) =>
      api.updateBooking(session.gymId, session.token, payload.bookingId, {
        status: payload.status,
      }),
    optimisticUpdate: (queryClient, _session, payload) => {
      queryClient.setQueriesData<Array<{ id: string; status: string }>>({ queryKey: ["bookings"] }, (old = []) =>
        old.map((booking) =>
          booking.id === payload.bookingId ? { ...booking, status: payload.status } : booking,
        ),
      );
    },
  });
}

export function useCreateRoutine() {
  return useOptimisticGymMutation({
    lockKey: () => "routines:create",
    affectedQueryKeys: (session) => [["routines", session.gymId]],
    mutationFn: (session, payload: { name: string; description?: string }) =>
      api.createRoutine(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      const optimisticRoutine: Routine = {
        id: makeId("rtn"),
        name: payload.name,
        description: payload.description ?? null,
      };
      queryClient.setQueriesData<Routine[]>({ queryKey: ["routines"] }, (old = []) => [
        optimisticRoutine,
        ...old,
      ]);
    },
  });
}

export function useCreateExercise() {
  return useOptimisticGymMutation({
    lockKey: () => "exercises:create",
    affectedQueryKeys: (session) => [["exercises", session.gymId]],
    mutationFn: (session, payload: { name: string; description?: string }) =>
      api.createExercise(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      queryClient.setQueriesData<Array<{ id: string; name: string; description?: string | null }>>(
        { queryKey: ["exercises"] },
        (old = []) => [
          { id: makeId("exr"), name: payload.name, description: payload.description ?? null },
          ...old,
        ],
      );
    },
  });
}

export function useAssignRoutine() {
  return useOptimisticGymMutation({
    lockKey: (payload: { userId: string; routineId: string }) =>
      `routines:assign:${payload.userId}:${payload.routineId}`,
    affectedQueryKeys: (session) => [["workoutSessions", session.gymId]],
    mutationFn: (
      session,
      payload: {
        userId: string;
        routineId: string;
        assignedBy?: string;
        startDate: string;
        endDate?: string;
      },
    ) => api.assignRoutine(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      const optimisticAssignedSession: WorkoutSession = {
        id: makeId("assign"),
        userId: payload.userId,
        routineId: payload.routineId,
        startedAt: payload.startDate,
        status: "ASSIGNED",
      };
      queryClient.setQueriesData<WorkoutSession[]>({ queryKey: ["workoutSessions"] }, (old = []) => [
        optimisticAssignedSession,
        ...old,
      ]);
    },
  });
}

export function useAddRoutineExercise() {
  return useOptimisticGymMutation({
    lockKey: (payload: { routineId: string; exerciseId: string; sets: number; reps: number }) =>
      `routine-exercise:add:${payload.routineId}:${payload.exerciseId}`,
    affectedQueryKeys: (session, payload) => [
      ["routineExercises", session.gymId, payload.routineId],
      ["exercises", session.gymId],
    ],
    mutationFn: (session, payload: { routineId: string; exerciseId: string; sets: number; reps: number }) =>
      api.addRoutineExercise(session.gymId, session.token, payload),
  });
}

export function useCreateWorkoutSession() {
  return useOptimisticGymMutation({
    lockKey: (payload: { userId: string; routineId: string }) =>
      `workout-sessions:create:${payload.userId}:${payload.routineId}`,
    affectedQueryKeys: (session) => [["workoutSessions", session.gymId], ["trainingLive", session.gymId]],
    mutationFn: (session, payload: { userId: string; routineId: string; startedAt: string }) =>
      api.createWorkoutSession(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      const optimisticSession: WorkoutSession = {
        id: makeId("ws"),
        userId: payload.userId,
        routineId: payload.routineId,
        startedAt: payload.startedAt,
        status: "ACTIVE",
      };
      queryClient.setQueriesData<WorkoutSession[]>({ queryKey: ["workoutSessions"] }, (old = []) => [
        optimisticSession,
        ...old,
      ]);
    },
  });
}

export function useCreateExerciseLog() {
  return useOptimisticGymMutation({
    lockKey: (payload: { workoutSessionId: string; exerciseId: string }) =>
      `exercise-log:create:${payload.workoutSessionId}:${payload.exerciseId}`,
    affectedQueryKeys: (session) => [["trainingLive", session.gymId]],
    mutationFn: (session, payload: { workoutSessionId: string; exerciseId: string; notes?: string }) =>
      api.createExerciseLog(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient) => {
      queryClient.setQueriesData<Array<{ id: string; exercise: string; reps: number; weight: number; done: boolean }>>(
        { queryKey: ["trainingLive"] },
        (old = []) => [
          { id: makeId("log"), exercise: "Nuevo ejercicio", reps: 0, weight: 0, done: false },
          ...old,
        ],
      );
    },
  });
}

export function useCreateSetLog() {
  return useOptimisticGymMutation({
    lockKey: (payload: { exerciseLogId: string }) => `set-log:create:${payload.exerciseLogId}`,
    affectedQueryKeys: (session) => [["trainingLive", session.gymId]],
    mutationFn: (
      session,
      payload: { exerciseLogId: string; reps: number; weight: number; duration?: number; restTime?: number },
    ) => api.createSetLog(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      queryClient.setQueriesData<Array<{ id: string; exercise: string; reps: number; weight: number; done: boolean }>>(
        { queryKey: ["trainingLive"] },
        (old = []) =>
          old.map((item, index) =>
            index === 0
              ? { ...item, reps: payload.reps || item.reps, weight: payload.weight || item.weight, done: true }
              : item,
          ),
      );
    },
  });
}

export function useCreateCheckin() {
  return useOptimisticGymMutation({
    lockKey: (payload: { userId: string }) => `checkins:create:${payload.userId}`,
    affectedQueryKeys: (session) => [["checkins", session.gymId], ["activities", session.gymId]],
    mutationFn: (
      session,
      payload: {
        userId: string;
        validateBy?: string;
        type?: "MANUAL" | "QR" | "BIOMETRIC";
      },
    ) => api.createCheckin(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      const optimisticCheckin: Checkin = {
        id: makeId("chk"),
        userId: payload.userId,
        type: payload.type ?? "MANUAL",
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueriesData<Checkin[]>({ queryKey: ["checkins"] }, (old = []) => [
        optimisticCheckin,
        ...old,
      ]);
    },
  });
}

export function useCreateProgress() {
  return useOptimisticGymMutation({
    lockKey: (payload: { userId: string }) => `progress:create:${payload.userId}`,
    affectedQueryKeys: (session) => [["activities", session.gymId]],
    mutationFn: (
      session,
      payload: {
        userId: string;
        weight?: string;
        bodyFat?: string;
        muscle?: string;
        measuredAt: string;
      },
    ) => api.createProgress(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      const optimisticActivity: UserActivity = {
        id: makeId("act"),
        userId: payload.userId,
        type: "PROGRESS_UPDATE",
        createdAt: payload.measuredAt,
      };
      queryClient.setQueriesData<UserActivity[]>({ queryKey: ["activities"] }, (old = []) => [
        optimisticActivity,
        ...old,
      ]);
    },
  });
}

export function useCreateSocialPost() {
  return useOptimisticGymMutation({
    lockKey: () => "social-posts:create",
    affectedQueryKeys: (session) => [["socialPosts", session.gymId]],
    mutationFn: (session, payload: { userId: string; content: string; mediaUrl?: string }) =>
      api.createSocialPost(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      const optimisticPost: SocialPost = {
        id: makeId("post"),
        userId: payload.userId,
        content: payload.content,
        mediaUrl: payload.mediaUrl ?? null,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        isLiked: false,
      };
      queryClient.setQueriesData<SocialPost[]>({ queryKey: ["socialPosts"] }, (old = []) => [
        optimisticPost,
        ...old,
      ]);
    },
  });
}

export function useCreateProfileMediaPost() {
  return useOptimisticGymMutation({
    lockKey: () => "profile-media-posts:create",
    affectedQueryKeys: (session) => [["profileMediaPosts", session.gymId]],
    mutationFn: (
      session,
      payload: { userId: string; type: "IMAGE" | "VIDEO"; mediaUrl: string; caption?: string },
    ) => api.createProfileMediaPost(session.gymId, session.token, payload),
  });
}

export function useCreateSocialComment() {
  return useOptimisticGymMutation({
    lockKey: (payload: { postId: string; userId: string }) =>
      `social-comment:create:${payload.postId}:${payload.userId}`,
    affectedQueryKeys: (session) => [["socialPosts", session.gymId]],
    mutationFn: (session, payload: { postId: string; userId: string; content: string; parentId?: string }) =>
      api.createSocialComment(session.gymId, session.token, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      queryClient.setQueriesData<SocialPost[]>({ queryKey: ["socialPosts"] }, (old = []) =>
        old.map((post) =>
          post.id === payload.postId
            ? {
                ...post,
                content: post.content,
              }
            : post,
        ),
      );
    },
  });
}

export function useLikeSocialPost() {
  return useOptimisticGymMutation({
    lockKey: (payload: { postId: string; userId: string }) =>
      `social-like:toggle:${payload.postId}:${payload.userId}`,
    affectedQueryKeys: (session) => [["socialPosts", session.gymId]],
    mutationFn: (session, payload: { postId: string; userId: string }) =>
      api.likePost(session.gymId, session.token, payload.postId, payload.userId),
    optimisticUpdate: (queryClient, _session, payload) => {
      queryClient.setQueriesData<SocialPost[]>({ queryKey: ["socialPosts"] }, (old = []) =>
        old.map((post) => {
          if (post.id !== payload.postId) return post;
          const isLiked = Boolean(post.isLiked);
          return {
            ...post,
            isLiked: !isLiked,
            likeCount: Math.max(0, Number(post.likeCount ?? 0) + (isLiked ? -1 : 1)),
          };
        }),
      );
    },
  });
}

export function useMarkNotificationRead() {
  return useOptimisticGymMutation({
    lockKey: (payload: { notificationId: string }) => `notifications:read:${payload.notificationId}`,
    affectedQueryKeys: (session) => [["notifications", session.gymId]],
    mutationFn: (session, payload: { notificationId: string; isRead: boolean }) =>
      api.markNotificationRead(session.gymId, session.token, payload.notificationId, payload.isRead),
    optimisticUpdate: (queryClient, _session, payload) => {
      queryClient.setQueriesData<NotificationItem[]>({ queryKey: ["notifications"] }, (old = []) =>
        old.map((notification) =>
          notification.id === payload.notificationId
            ? { ...notification, isRead: payload.isRead }
            : notification,
        ),
      );
    },
  });
}

export function useUpdateNotificationPreferences() {
  return useOptimisticGymMutation({
    lockKey: (payload: { userId: string }) => `notification-prefs:update:${payload.userId}`,
    affectedQueryKeys: (session) => [["notificationPreferences", session.gymId]],
    mutationFn: (
      session,
      payload: {
        userId: string;
        emailEnabled?: boolean;
        pushEnabled?: boolean;
        smsEnabled?: boolean;
      },
    ) => api.updateNotificationPreferences(session.gymId, session.token, payload.userId, payload),
    optimisticUpdate: (queryClient, _session, payload) => {
      queryClient.setQueriesData<NotificationPreferences>(
        { queryKey: ["notificationPreferences"] },
        (old) => (old ? { ...old, ...payload } : old),
      );
    },
  });
}
