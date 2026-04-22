import { apiRequest } from "@/lib/api/client";
import type {
  AuthResponse,
  ClassSession,
  Checkin,
  Exercise,
  FitnessClass,
  Gym,
  Payment,
  Plan,
  RevenuePoint,
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

const mockGyms: Gym[] = [
  { id: "g1", name: "Gym Control Downtown", members: 412, activeClasses: 19 },
];

const mockUsers: User[] = [
  {
    id: "u1",
    name: "Sofía Trainer",
    email: "sofia@gymcontrol.app",
    role: "TRAINER",
    membershipStatus: "ACTIVE",
  },
  {
    id: "u2",
    name: "Mario Client",
    email: "mario@gymcontrol.app",
    role: "CLIENT",
    membershipStatus: "TRIAL",
  },
];

const mockRevenue: RevenuePoint[] = [
  { label: "Lun", value: 580 },
  { label: "Mar", value: 620 },
  { label: "Mie", value: 540 },
  { label: "Jue", value: 710 },
  { label: "Vie", value: 930 },
  { label: "Sab", value: 640 },
];

const mockSchedule: ClassSession[] = [
  {
    id: "c1",
    title: "HIIT Performance",
    trainer: "Sofía",
    startsAt: "08:00",
    endsAt: "09:00",
    occupancy: 86,
  },
  {
    id: "c2",
    title: "Mobility Recovery",
    trainer: "Rafa",
    startsAt: "18:30",
    endsAt: "19:15",
    occupancy: 52,
  },
];

const mockTraining: TrainingSet[] = [
  { id: "s1", exercise: "Back Squat", reps: 8, weight: 95, done: true },
  { id: "s2", exercise: "Bench Press", reps: 10, weight: 62.5, done: false },
  { id: "s3", exercise: "Deadlift", reps: 5, weight: 120, done: false },
];

async function withFallback<T>(request: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await request();
  } catch {
    return fallback;
  }
}

const mockSocialPosts: SocialPost[] = [
  {
    id: "p1",
    userId: "u1",
    content: "Sesion de tren superior completa. Cerre 4 series de press con muy buena tecnica.",
    createdAt: new Date().toISOString(),
    likeCount: 4,
    isLiked: false,
    comments: [],
  },
];

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
  gyms: (token: string) => withFallback(() => apiRequest<Gym[]>("/gyms", { token }), mockGyms),
  users: (gymId: string, token: string) =>
    withFallback(
      () => apiRequest<User[]>(`/gyms/${gymId}/users`, { gymId, token }),
      mockUsers,
    ),
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
    withFallback(
      () => apiRequest<Plan[]>(`/gyms/${gymId}/billing/plans`, { gymId, token }),
      [],
    ),
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
    withFallback(
      () => apiRequest<Array<{ id: string; status: string }>>(`/gyms/${gymId}/billing/memberships`, { gymId, token }),
      [],
    ),
  payments: (gymId: string, token: string) =>
    withFallback(
      () =>
        apiRequest<Payment[]>(
          `/gyms/${gymId}/billing/payments`,
          { gymId, token },
        ),
      [],
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
  revenue: (gymId: string, token: string) =>
    withFallback(
      async () => {
        const payments = await apiRequest<Array<{ createdAt: string; finalAmount: number }>>(
          `/gyms/${gymId}/billing/payments`,
          { gymId, token },
        );
        return payments.slice(0, 6).map((payment, index) => ({
          label: `D${index + 1}`,
          value: Number(payment.finalAmount ?? 0),
        }));
      },
      mockRevenue,
    ),
  schedule: (gymId: string, token: string) =>
    withFallback(
      async () => {
        const sessions = await apiRequest<
          Array<{
            id: string;
            startTime: string;
            endTime: string;
            classRef?: { name?: string; trainer?: { name?: string } };
          }>
        >(`/gyms/${gymId}/scheduling/sessions`, { gymId, token });

        return sessions.map((session) => ({
          id: session.id,
          title: session.classRef?.name ?? "Clase",
          trainer: session.classRef?.trainer?.name ?? "Sin asignar",
          startsAt: session.startTime,
          endsAt: session.endTime,
          occupancy: 60,
        })) as ClassSession[];
      },
      mockSchedule,
    ),
  classes: (gymId: string, token: string) =>
    withFallback(
      () => apiRequest<FitnessClass[]>(`/gyms/${gymId}/scheduling/classes`, { gymId, token }),
      [],
    ),
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
    withFallback(
      () =>
        apiRequest<Array<{ id: string; sessionId: string; userId: string; status: string }>>(
          `/gyms/${gymId}/scheduling/bookings${userId ? `?userId=${userId}` : ""}`,
          { gymId, token },
        ),
      [],
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
  trainingLive: (gymId: string, token: string) =>
    withFallback(
      async () => {
        const sessions = await apiRequest<Array<{ id: string; routine?: { name?: string } }>>(
          `/gyms/${gymId}/training-execution/workout-sessions`,
          { gymId, token },
        );
        return sessions.slice(0, 3).map((session, index) => ({
          id: session.id,
          exercise: session.routine?.name ?? `Bloque ${index + 1}`,
          reps: 10,
          weight: 50 + index * 10,
          done: index === 0,
        })) as TrainingSet[];
      },
      mockTraining,
    ),
  routines: (gymId: string, token: string) =>
    withFallback(
      () => apiRequest<Routine[]>(`/gyms/${gymId}/training/routines`, { gymId, token }),
      [],
    ),
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
    withFallback(
      () => apiRequest<RoutineExercise[]>(`/gyms/${gymId}/training/routines/${routineId}/exercises`, { gymId, token }),
      [],
    ),
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
    withFallback(
      () => apiRequest<Exercise[]>(`/gyms/${gymId}/training/exercises`, { gymId, token }),
      [],
    ),
  workoutSessions: (gymId: string, token: string, userId?: string) =>
    withFallback(
      () =>
        apiRequest<WorkoutSession[]>(
          `/gyms/${gymId}/training-execution/workout-sessions${
            userId ? `?userId=${userId}` : ""
          }`,
          { gymId, token },
        ),
      [],
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
    withFallback(
      () => apiRequest<Checkin[]>(`/gyms/${gymId}/activity/checkins`, { gymId, token }),
      [],
    ),
  nutritionPlans: (gymId: string, token: string, userId?: string) =>
    withFallback(
      () =>
        apiRequest<NutritionPlan[]>(
          `/gyms/${gymId}/nutrition/plans${userId ? `?userId=${userId}` : ""}`,
          { gymId, token },
        ),
      [],
    ),
  nutritionMeals: (gymId: string, token: string, nutritionPlanId?: string) =>
    withFallback(
      () =>
        apiRequest<NutritionMeal[]>(
          `/gyms/${gymId}/nutrition/meals${nutritionPlanId ? `?nutritionPlanId=${nutritionPlanId}` : ""}`,
          { gymId, token },
        ),
      [],
    ),
  activities: (gymId: string, token: string) =>
    withFallback(
      () =>
        apiRequest<UserActivity[]>(`/gyms/${gymId}/activity/user-activities`, {
          gymId,
          token,
        }),
      [],
    ),
  socialPosts: (
    gymId: string,
    token: string,
    userId?: string,
    filter: "all" | "own" | "liked" = "all",
  ) =>
    withFallback(
      () => {
        const params = new URLSearchParams();
        if (userId) params.set("userId", userId);
        if (filter !== "all") params.set("filter", filter);
        const query = params.toString();
        return apiRequest<SocialPost[]>(
          `/gyms/${gymId}/social/posts${query ? `?${query}` : ""}`,
          { gymId, token },
        );
      },
      mockSocialPosts,
    ),
  createSocialPost: (
    gymId: string,
    token: string,
    payload: { userId: string; content: string; mediaUrl?: string },
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
    withFallback(
      () =>
        apiRequest<ProfileMediaPost[]>(
          `/gyms/${gymId}/social/media-posts${userId ? `?userId=${userId}` : ""}`,
          { gymId, token },
        ),
      [],
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
  notifications: (gymId: string, token: string, userId?: string) =>
    withFallback(
      () =>
        apiRequest<NotificationItem[]>(
          `/gyms/${gymId}/notifications${userId ? `?userId=${userId}` : ""}`,
          {
            gymId,
            token,
          },
        ),
      [],
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
    withFallback(
      () =>
        apiRequest<NotificationPreferences>(
          `/gyms/${gymId}/notifications/preferences/${userId}`,
          { gymId, token },
        ),
      {
        id: "local",
        userId,
        gymId,
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
      },
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
};
