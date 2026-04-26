import { apiRequest } from "@/lib/api/client";
import type {
  AuditLogEntry,
  AuthResponse,
  ClassSchedule,
  ClassSession,
  Checkin,
  Discount,
  Exercise,
  FitnessClass,
  Food,
  Gym,
  MediaComment,
  MediaLike,
  MealFood,
  Membership,
  Payment,
  Plan,
  SocialComment,
  SocialPost,
  Routine,
  TrainingSet,
  NotificationItem,
  NotificationPreferences,
  ProfileMediaPost,
  NutritionMeal,
  NutritionPlan,
  RoutineExercise,
  UserActivity,
  User,
  WorkoutSession,
} from "@/lib/types";

export const api = {
  auth: {
    login: (payload: { email: string; password: string }) =>
      apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: payload,
      }),
    me: (token: string) =>
      apiRequest<{ id: string; gymId: string; name: string; email: string | null }>(
        "/auth/me",
        {
          token,
        },
      ),
  },
  gyms: async (token: string) => {
    const gyms = await apiRequest<Array<{ id: string; name: string }>>("/gyms", { token });
    return gyms.map((gym) => ({
      id: gym.id,
      name: gym.name,
      members: 0,
      activeClasses: 0,
    })) as Gym[];
  },
  users: (gymId: string, token: string) =>
    apiRequest<User[]>(`/gyms/${gymId}/users`, { gymId, token }),
  createUser: (
    gymId: string,
    token: string,
    payload: { name: string; email?: string; phone?: string; bio?: string },
  ) =>
    apiRequest<User>(`/gyms/${gymId}/users`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  updateUser: (
    gymId: string,
    userId: string,
    token: string,
    payload: { name?: string; email?: string; phone?: string; bio?: string },
  ) =>
    apiRequest<User>(`/gyms/${gymId}/users/${userId}`, {
      method: "PATCH",
      gymId,
      token,
      body: payload,
    }),
  plans: (gymId: string, token: string) =>
    apiRequest<Plan[]>(`/gyms/${gymId}/billing/plans`, { gymId, token }),
  createPlan: (
    gymId: string,
    token: string,
    payload: { name: string; duration: number; price: number },
  ) =>
    apiRequest<Plan>(`/gyms/${gymId}/billing/plans`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  createMembership: (
    gymId: string,
    token: string,
    payload: {
      planId: string;
      userId: string;
      startDate: string;
      endDate: string;
      status?: "ACTIVE" | "INACTIVE" | "EXPIRED" | "CANCELLED" | "SUSPENDED";
    },
  ) =>
    apiRequest<{ id: string; status: string; userId: string; planId: string }>(
      `/gyms/${gymId}/billing/memberships`,
      {
        method: "POST",
        gymId,
        token,
        body: payload,
      },
    ),
  memberships: (gymId: string, token: string) =>
    apiRequest<Membership[]>(`/gyms/${gymId}/billing/memberships`, { gymId, token }),
  payments: (gymId: string, token: string) =>
    apiRequest<Payment[]>(
      `/gyms/${gymId}/billing/payments`,
      { gymId, token },
    ),
  createPayment: (
    gymId: string,
    token: string,
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
  ) =>
    apiRequest<Payment>(`/gyms/${gymId}/billing/payments`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  discounts: (gymId: string, token: string) =>
    apiRequest<Discount[]>(`/gyms/${gymId}/billing/discounts`, { gymId, token }),
  createDiscount: (
    gymId: string,
    token: string,
    payload: {
      name: string;
      code: string;
      type: "PERCENTAGE" | "FIXED";
      value: number;
      startDate: string;
      endDate?: string;
    },
  ) =>
    apiRequest<Discount>(`/gyms/${gymId}/billing/discounts`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  revenue: async (gymId: string, token: string) => {
    const payments = await apiRequest<Array<{ createdAt: string; finalAmount: number }>>(
      `/gyms/${gymId}/billing/payments`,
      { gymId, token },
    );
    return payments.slice(0, 6).map((payment, index) => ({
      label: `D${index + 1}`,
      value: Number(payment.finalAmount ?? 0),
    }));
  },
  schedule: async (gymId: string, token: string) => {
    const sessions = await apiRequest<
      Array<{
        id: string;
        classId: string;
        startTime: string;
        endTime: string;
        status: string;
      }>
    >(`/gyms/${gymId}/scheduling/sessions`, { gymId, token });

    return sessions.map((session) => ({
      id: session.id,
      classId: session.classId,
      title: session.classId,
      trainer: "Sin asignar",
      startsAt: session.startTime,
      endsAt: session.endTime,
      occupancy: 0,
      status: session.status,
    })) as ClassSession[];
  },
  classes: (gymId: string, token: string) =>
    apiRequest<FitnessClass[]>(`/gyms/${gymId}/scheduling/classes`, { gymId, token }),
  createClass: (
    gymId: string,
    token: string,
    payload: { name: string; description?: string; trainerId?: string; capacity: number },
  ) =>
    apiRequest<FitnessClass>(`/gyms/${gymId}/scheduling/classes`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  bookings: (gymId: string, token: string, userId?: string) =>
    apiRequest<Array<{ id: string; sessionId: string; userId: string; status: string }>>(
      `/gyms/${gymId}/scheduling/bookings${userId ? `?userId=${userId}` : ""}`,
      { gymId, token },
    ),
  createBooking: (
    gymId: string,
    token: string,
    payload: { sessionId: string; userId: string },
  ) =>
    apiRequest<{ id: string; sessionId: string; userId: string; status: string }>(
      `/gyms/${gymId}/scheduling/bookings`,
      {
        method: "POST",
        gymId,
        token,
        body: payload,
      },
    ),
  updateBooking: (
    gymId: string,
    token: string,
    bookingId: string,
    payload: { status: "BOOKED" | "CANCELLED" | "ATTENDED" | "NO_SHOW" },
  ) =>
    apiRequest<{ id: string; status: string }>(
      `/gyms/${gymId}/scheduling/bookings/${bookingId}`,
      {
        method: "PATCH",
        gymId,
        token,
        body: payload,
      },
    ),
  updateClass: (
    gymId: string,
    classId: string,
    token: string,
    payload: { name?: string; description?: string; trainerId?: string; capacity?: number },
  ) =>
    apiRequest<FitnessClass>(`/gyms/${gymId}/scheduling/classes/${classId}`, {
      method: "PATCH",
      gymId,
      token,
      body: payload,
    }),
  deleteClass: (gymId: string, classId: string, token: string) =>
    apiRequest<{ id: string; deletedAt: string }>(`/gyms/${gymId}/scheduling/classes/${classId}/delete`, {
      method: "PATCH",
      gymId,
      token,
    }),
  updateSession: (
    gymId: string,
    token: string,
    sessionId: string,
    payload: { startTime?: string; endTime?: string; status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" },
  ) =>
    apiRequest<{ id: string; status: string; startTime: string; endTime: string }>(
      `/gyms/${gymId}/scheduling/sessions/${sessionId}`,
      {
        method: "PATCH",
        gymId,
        token,
        body: payload,
      },
    ),
  createSession: (
    gymId: string,
    token: string,
    payload: { classId: string; date: string; startTime: string; endTime: string },
  ) =>
    apiRequest<{ id: string; classId: string; startTime: string; endTime: string }>(
      `/gyms/${gymId}/scheduling/sessions`,
      {
        method: "POST",
        gymId,
        token,
        body: payload,
      },
    ),
  schedules: (gymId: string, token: string) =>
    apiRequest<ClassSchedule[]>(`/gyms/${gymId}/scheduling/schedules`, {
      gymId,
      token,
    }),
  createSchedule: (
    gymId: string,
    token: string,
    payload: {
      classId: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isActive?: boolean;
    },
  ) =>
    apiRequest<ClassSchedule>(`/gyms/${gymId}/scheduling/schedules`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  updateSchedule: (
    gymId: string,
    token: string,
    scheduleId: string,
    payload: {
      dayOfWeek?: number;
      startTime?: string;
      endTime?: string;
      isActive?: boolean;
    },
  ) =>
    apiRequest<ClassSchedule>(`/gyms/${gymId}/scheduling/schedules/${scheduleId}`, {
      method: "PATCH",
      gymId,
      token,
      body: payload,
    }),
  trainingLive: async (gymId: string, token: string) => {
    const sessions = await apiRequest<Array<{ id: string; routineId: string; status: string }>>(
      `/gyms/${gymId}/training-execution/workout-sessions`,
      { gymId, token },
    );
    return sessions.slice(0, 3).map((session) => ({
      id: session.id,
      exercise: session.routineId,
      reps: 0,
      weight: 0,
      done: session.status === "COMPLETED",
    })) as TrainingSet[];
  },
  routines: (gymId: string, token: string) =>
    apiRequest<Routine[]>(`/gyms/${gymId}/training/routines`, { gymId, token }),
  createRoutine: (
    gymId: string,
    token: string,
    payload: { name: string; description?: string },
  ) =>
    apiRequest<Routine>(`/gyms/${gymId}/training/routines`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  createExercise: (
    gymId: string,
    token: string,
    payload: { name: string; description?: string },
  ) =>
    apiRequest<Exercise>(`/gyms/${gymId}/training/exercises`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  addRoutineExercise: (
    gymId: string,
    token: string,
    payload: { routineId: string; exerciseId: string; sets: number; reps: number },
  ) =>
    apiRequest<RoutineExercise>(`/gyms/${gymId}/training/routine-exercises`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  routineExercises: (gymId: string, token: string, routineId: string) =>
    apiRequest<RoutineExercise[]>(`/gyms/${gymId}/training/routines/${routineId}/exercises`, { gymId, token }),
  assignRoutine: (
    gymId: string,
    token: string,
    payload: {
      userId: string;
      routineId: string;
      assignedBy?: string;
      startDate: string;
      endDate?: string;
    },
  ) =>
    apiRequest<{ id: string; userId: string; routineId: string }>(
      `/gyms/${gymId}/training/user-routines`,
      {
        method: "POST",
        gymId,
        token,
        body: payload,
      },
    ),
  userRoutines: (gymId: string, token: string, userId: string) =>
    apiRequest<
      Array<{
        id: string;
        userId: string;
        routineId: string;
        startDate: string;
        createdAt: string;
        routine: {
          id: string;
          name: string;
          exercises: Array<{
            id: string;
            reps: number;
            weight?: number | null;
            exercise?: { id: string; name: string } | null;
          }>;
        };
      }>
    >(`/gyms/${gymId}/training/user-routines?userId=${userId}`, { gymId, token }),
  createProgress: (
    gymId: string,
    token: string,
    payload: { userId: string; weight?: string; bodyFat?: string; muscle?: string; measuredAt: string },
  ) =>
    apiRequest<{ id: string; userId: string }>(`/gyms/${gymId}/training/progress`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  exercises: (gymId: string, token: string) =>
    apiRequest<Exercise[]>(`/gyms/${gymId}/training/exercises`, { gymId, token }),
  workoutSessions: (gymId: string, token: string, userId?: string) =>
    apiRequest<WorkoutSession[]>(
      `/gyms/${gymId}/training-execution/workout-sessions${
        userId ? `?userId=${userId}` : ""
      }`,
      { gymId, token },
    ),
  createWorkoutSession: (
    gymId: string,
    token: string,
    payload: { userId: string; routineId: string; startedAt: string },
  ) =>
    apiRequest<WorkoutSession>(`/gyms/${gymId}/training-execution/workout-sessions`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  updateWorkoutSession: (
    gymId: string,
    token: string,
    workoutSessionId: string,
    payload: { endedAt?: string; status?: "IN_PROGRESS" | "COMPLETED" | "ABANDONED" },
  ) =>
    apiRequest<WorkoutSession>(`/gyms/${gymId}/training-execution/workout-sessions/${workoutSessionId}`, {
      method: "PATCH",
      gymId,
      token,
      body: payload,
    }),
  createExerciseLog: (
    gymId: string,
    token: string,
    payload: { workoutSessionId: string; exerciseId: string; notes?: string },
  ) =>
    apiRequest<{ id: string; workoutSessionId: string; exerciseId: string }>(
      `/gyms/${gymId}/training-execution/exercise-logs`,
      {
        method: "POST",
        gymId,
        token,
        body: payload,
      },
    ),
  createSetLog: (
    gymId: string,
    token: string,
    payload: { exerciseLogId: string; reps: number; weight: number; duration?: number; restTime?: number },
  ) =>
    apiRequest<{ id: string; reps: number; weight: number }>(
      `/gyms/${gymId}/training-execution/set-logs`,
      {
        method: "POST",
        gymId,
        token,
        body: payload,
      },
    ),
  createCheckin: (
    gymId: string,
    token: string,
    payload: { userId: string; validateBy?: string; type?: "MANUAL" | "QR" | "BIOMETRIC" },
  ) =>
    apiRequest<Checkin>(`/gyms/${gymId}/activity/checkins`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  checkins: (gymId: string, token: string) =>
    apiRequest<Checkin[]>(`/gyms/${gymId}/activity/checkins`, { gymId, token }),
  nutritionPlans: (gymId: string, token: string, userId?: string) =>
    apiRequest<NutritionPlan[]>(
      `/gyms/${gymId}/nutrition/plans${userId ? `?userId=${userId}` : ""}`,
      { gymId, token },
    ),
  nutritionMeals: (gymId: string, token: string, nutritionPlanId?: string) =>
    apiRequest<NutritionMeal[]>(
      `/gyms/${gymId}/nutrition/meals${nutritionPlanId ? `?nutritionPlanId=${nutritionPlanId}` : ""}`,
      { gymId, token },
    ),
  foods: (gymId: string, token: string) =>
    apiRequest<Food[]>(`/gyms/${gymId}/nutrition/foods`, { gymId, token }),
  createFood: (
    gymId: string,
    token: string,
    payload: {
      name: string;
      caloriesPer100g: number;
      proteinPer100g: number;
      carbsPer100g: number;
      fatPer100g: number;
    },
  ) =>
    apiRequest<Food>(`/gyms/${gymId}/nutrition/foods`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  addMealFood: (
    gymId: string,
    token: string,
    payload: {
      mealId: string;
      foodId: string;
      quantity: number;
      unit: "g" | "ml" | "unit" | "cup" | "tbsp" | "tsp";
    },
  ) =>
    apiRequest<MealFood>(`/gyms/${gymId}/nutrition/meal-foods`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  activities: (gymId: string, token: string) =>
    apiRequest<UserActivity[]>(`/gyms/${gymId}/activity/user-activities`, {
      gymId,
      token,
    }),
  socialPosts: (
    gymId: string,
    token: string,
    userId?: string,
    filter: "all" | "own" | "liked" = "all",
  ) =>
    (() => {
      const params = new URLSearchParams();
      if (userId) params.set("userId", userId);
      if (filter !== "all") params.set("filter", filter);
      const query = params.toString();
      return apiRequest<SocialPost[]>(
        `/gyms/${gymId}/social/posts${query ? `?${query}` : ""}`,
        { gymId, token },
      );
    })(),
  createSocialPost: (
    gymId: string,
    token: string,
    payload: {
      userId: string;
      content: string;
      mediaUrl?: string;
      postType?: "PUBLICATION" | "ACHIEVEMENT" | "NUTRITION";
    },
  ) =>
    apiRequest<SocialPost>(`/gyms/${gymId}/social/posts`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  createProfileMediaPost: (
    gymId: string,
    token: string,
    payload: { userId: string; type: "IMAGE" | "VIDEO"; mediaUrl: string; caption?: string },
  ) =>
    apiRequest<ProfileMediaPost>(`/gyms/${gymId}/social/media-posts`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  profileMediaPosts: (gymId: string, token: string, userId?: string) =>
    apiRequest<ProfileMediaPost[]>(
      `/gyms/${gymId}/social/media-posts${userId ? `?userId=${userId}` : ""}`,
      { gymId, token },
    ),
  createSocialComment: (
    gymId: string,
    token: string,
    payload: { postId: string; userId: string; content: string; parentId?: string },
  ) =>
    apiRequest<SocialComment>(`/gyms/${gymId}/social/comments`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  likePost: (gymId: string, token: string, postId: string, userId: string) =>
    apiRequest<{ postId: string; userId: string; isLiked: boolean; likeCount: number }>(
      `/gyms/${gymId}/social/post-likes?postId=${postId}&userId=${userId}`,
      {
        method: "POST",
        gymId,
        token,
      },
    ),
  likeMediaPost: (gymId: string, token: string, mediaPostId: string, userId: string) =>
    apiRequest<MediaLike>(
      `/gyms/${gymId}/social/media-likes?mediaPostId=${mediaPostId}&userId=${userId}`,
      {
        method: "POST",
        gymId,
        token,
      },
    ),
  createMediaComment: (
    gymId: string,
    token: string,
    payload: { mediaPostId: string; userId: string; content: string },
  ) =>
    apiRequest<MediaComment>(`/gyms/${gymId}/social/media-comments`, {
      method: "POST",
      gymId,
      token,
      body: payload,
    }),
  mediaComments: (gymId: string, token: string, mediaPostId: string) =>
    apiRequest<MediaComment[]>(
      `/gyms/${gymId}/social/media-comments?mediaPostId=${mediaPostId}`,
      { gymId, token },
    ),
  notifications: (gymId: string, token: string, userId?: string) =>
    apiRequest<NotificationItem[]>(
      `/gyms/${gymId}/notifications${userId ? `?userId=${userId}` : ""}`,
      {
        gymId,
        token,
      },
    ),
  markNotificationRead: (
    gymId: string,
    token: string,
    notificationId: string,
    isRead: boolean,
  ) =>
    apiRequest<NotificationItem>(`/gyms/${gymId}/notifications/${notificationId}/read-status`, {
      method: "PATCH",
      gymId,
      token,
      body: { isRead },
    }),
  notificationPreferences: (gymId: string, token: string, userId: string) =>
    apiRequest<NotificationPreferences>(
      `/gyms/${gymId}/notifications/preferences/${userId}`,
      { gymId, token },
    ),
  updateNotificationPreferences: (
    gymId: string,
    token: string,
    userId: string,
    payload: { emailEnabled?: boolean; pushEnabled?: boolean; smsEnabled?: boolean },
  ) =>
    apiRequest<NotificationPreferences>(`/gyms/${gymId}/notifications/preferences/${userId}`, {
      method: "PATCH",
      gymId,
      token,
      body: payload,
    }),
  permissions: (gymId: string, token: string) =>
    apiRequest<Array<{ id: string; resource: string; action: string; scope: string; name: string }>>(
      `/gyms/${gymId}/rbac/permissions`,
      { gymId, token },
    ),
  createPermission: (
    gymId: string,
    token: string,
    payload: {
      name: string;
      resource: string;
      action: string;
      scope: "OWN" | "GYM" | "GLOBAL";
    },
  ) =>
    apiRequest<{ id: string; resource: string; action: string; scope: string; name: string }>(
      `/gyms/${gymId}/rbac/permissions`,
      {
        method: "POST",
        gymId,
        token,
        body: payload,
      },
    ),
  rbacRoles: (gymId: string, token: string) =>
    apiRequest<Array<{ id: string; name: string; description?: string | null }>>(
      `/gyms/${gymId}/rbac/roles`,
      { gymId, token },
    ),
  createRbacRole: (
    gymId: string,
    token: string,
    payload: { name: string; description?: string },
  ) =>
    apiRequest<{ id: string; name: string; description?: string | null }>(
      `/gyms/${gymId}/rbac/roles`,
      {
        method: "POST",
        gymId,
        token,
        body: payload,
      },
    ),
  rolePermissions: (gymId: string, token: string, roleId: string) =>
    apiRequest<
      Array<{
        roleId: string;
        permissionId: string;
        permission: { id: string; resource: string; action: string; scope: string; name: string };
      }>
    >(`/gyms/${gymId}/rbac/roles/${roleId}/permissions`, { gymId, token }),
  assignRolePermission: (
    gymId: string,
    token: string,
    payload: { roleId: string; permissionId: string },
  ) =>
    apiRequest<{ roleId: string; permissionId: string }>(
      `/gyms/${gymId}/rbac/roles/${payload.roleId}/permissions/${payload.permissionId}`,
      {
        method: "POST",
        gymId,
        token,
      },
    ),
  removeRolePermission: (
    gymId: string,
    token: string,
    payload: { roleId: string; permissionId: string },
  ) =>
    apiRequest<{ count: number }>(
      `/gyms/${gymId}/rbac/roles/${payload.roleId}/permissions/${payload.permissionId}`,
      {
        method: "DELETE",
        gymId,
        token,
      },
    ),
  auditLogs: (
    token: string,
    payload: {
      tableName: string;
      recordId?: string;
    },
  ) =>
    apiRequest<AuditLogEntry[]>(
      `/audit/logs?tableName=${encodeURIComponent(payload.tableName)}${
        payload.recordId ? `&recordId=${encodeURIComponent(payload.recordId)}` : ""
      }`,
      { token },
    ),
};
