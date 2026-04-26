import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/services";
import { useSessionStore } from "@/lib/session-store";

function useSessionRequirements() {
  const token = useSessionStore((state) => state.accessToken);
  const gymId = useSessionStore((state) => state.user?.gymId);
  return { token, gymId, enabled: Boolean(token && gymId) };
}

export const useGyms = () =>
  useQuery({
    queryKey: ["gyms"],
    queryFn: async () => {
      const token = useSessionStore.getState().accessToken;
      if (!token) return [];
      return api.gyms(token);
    },
    enabled: Boolean(useSessionStore((state) => state.accessToken)),
  });

export const useUsers = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["users", gymId],
    queryFn: () => api.users(gymId!, token!),
    enabled,
  });
};

export const usePlans = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["plans", gymId],
    queryFn: () => api.plans(gymId!, token!),
    enabled,
  });
};

export const useMemberships = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["memberships", gymId],
    queryFn: () => api.memberships(gymId!, token!),
    enabled,
  });
};

export const usePayments = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["payments", gymId],
    queryFn: () => api.payments(gymId!, token!),
    enabled,
  });
};

export const useDiscounts = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["discounts", gymId],
    queryFn: () => api.discounts(gymId!, token!),
    enabled,
  });
};

export const useRevenue = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["revenue", gymId],
    queryFn: () => api.revenue(gymId!, token!),
    enabled,
  });
};

export const useSchedule = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["schedule", gymId],
    queryFn: () => api.schedule(gymId!, token!),
    enabled,
  });
};

export const useClassSchedules = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["classSchedules", gymId],
    queryFn: () => api.schedules(gymId!, token!),
    enabled,
  });
};

export const useClasses = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["classes", gymId],
    queryFn: () => api.classes(gymId!, token!),
    enabled,
  });
};

export const useBookings = (options?: { userId?: string | null }) => {
  const { token, gymId, enabled } = useSessionRequirements();
  const currentUserId = useSessionStore((state) => state.user?.id);
  const requestedUserId = options?.userId;
  const userId = requestedUserId === undefined ? currentUserId : requestedUserId ?? undefined;
  return useQuery({
    queryKey: ["bookings", gymId, userId ?? "all"],
    queryFn: () => api.bookings(gymId!, token!, userId),
    enabled,
  });
};

export const useTrainingLive = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["trainingLive", gymId],
    queryFn: () => api.trainingLive(gymId!, token!),
    enabled,
  });
};

export const useRoutines = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["routines", gymId],
    queryFn: () => api.routines(gymId!, token!),
    enabled,
  });
};

export const useExercises = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["exercises", gymId],
    queryFn: () => api.exercises(gymId!, token!),
    enabled,
  });
};

export const useRoutineExercises = (routineId?: string) => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["routineExercises", gymId, routineId],
    queryFn: () => api.routineExercises(gymId!, token!, routineId!),
    enabled: enabled && Boolean(routineId),
  });
};

export const useWorkoutSessions = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  const userId = useSessionStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["workoutSessions", gymId, userId],
    queryFn: () => api.workoutSessions(gymId!, token!, userId),
    enabled,
  });
};

export const useUserRoutines = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  const userId = useSessionStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["userRoutines", gymId, userId],
    queryFn: () => api.userRoutines(gymId!, token!, userId!),
    enabled: enabled && Boolean(userId),
  });
};

export const useCheckins = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["checkins", gymId],
    queryFn: () => api.checkins(gymId!, token!),
    enabled,
  });
};

export const useNutritionPlans = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  const userId = useSessionStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["nutritionPlans", gymId, userId],
    queryFn: () => api.nutritionPlans(gymId!, token!, userId),
    enabled: enabled && Boolean(userId),
  });
};

export const useNutritionMeals = (nutritionPlanId?: string) => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["nutritionMeals", gymId, nutritionPlanId],
    queryFn: () => api.nutritionMeals(gymId!, token!, nutritionPlanId),
    enabled: enabled && Boolean(nutritionPlanId),
  });
};

export const useFoods = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["foods", gymId],
    queryFn: () => api.foods(gymId!, token!),
    enabled,
  });
};

export const useActivities = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["activities", gymId],
    queryFn: () => api.activities(gymId!, token!),
    enabled,
  });
};

export const useAuditLogs = (tableName?: string, recordId?: string) => {
  const token = useSessionStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["auditLogs", tableName, recordId],
    queryFn: () => api.auditLogs(token!, { tableName: tableName!, recordId }),
    enabled: Boolean(token && tableName),
  });
};

export const useSocialPosts = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  const userId = useSessionStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["socialPosts", gymId, userId],
    queryFn: () => api.socialPosts(gymId!, token!, userId, "all"),
    enabled,
  });
};

export const useExploreSocialPosts = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  const userId = useSessionStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["socialPosts", "explore", gymId, userId],
    queryFn: async () => {
      const gyms = await api.gyms(token!);
      const otherGyms = gyms.filter((gym) => gym.id !== gymId);
      const postsByGym = await Promise.all(
        otherGyms.map(async (gym) => {
          const posts = await api.socialPosts(gym.id, token!, userId, "all");
          return posts.map((post) => ({
            ...post,
            sourceGymId: gym.id,
            sourceGymName: gym.name,
          }));
        }),
      );
      return postsByGym
        .flat()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    enabled,
  });
};

export const useSocialPostsByUserId = (targetUserId: string | null) => {
  const { token, gymId, enabled } = useSessionRequirements();
  const viewerId = useSessionStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["socialPosts", "byUser", gymId, viewerId, targetUserId],
    queryFn: async () => {
      const all = await api.socialPosts(gymId!, token!, viewerId, "all");
      return all
        .filter((p) => p.userId === targetUserId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    enabled: enabled && Boolean(viewerId) && Boolean(targetUserId),
  });
};

export const useProfileMediaPostsForUser = (targetUserId: string | null) => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["profileMediaPosts", gymId, "peer", targetUserId],
    queryFn: () => api.profileMediaPosts(gymId!, token!, targetUserId!),
    enabled: enabled && Boolean(targetUserId),
  });
};

export const useMySocialPosts = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  const userId = useSessionStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["socialPosts", "own", gymId, userId],
    queryFn: () => api.socialPosts(gymId!, token!, userId, "own"),
    enabled: enabled && Boolean(userId),
  });
};

export const useLikedSocialPosts = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  const userId = useSessionStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["socialPosts", "liked", gymId, userId],
    queryFn: () => api.socialPosts(gymId!, token!, userId, "liked"),
    enabled: enabled && Boolean(userId),
  });
};

export const useMyProfileMediaPosts = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  const userId = useSessionStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["profileMediaPosts", gymId, userId],
    queryFn: () => api.profileMediaPosts(gymId!, token!, userId),
    enabled: enabled && Boolean(userId),
  });
};

export const useNotifications = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  const userId = useSessionStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["notifications", gymId, userId],
    queryFn: () => api.notifications(gymId!, token!, userId),
    enabled,
  });
};

export const useNotificationPreferences = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  const userId = useSessionStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["notificationPreferences", gymId, userId],
    queryFn: () => api.notificationPreferences(gymId!, token!, userId!),
    enabled: enabled && Boolean(userId),
  });
};

export const usePermissions = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["permissions", gymId],
    queryFn: () => api.permissions(gymId!, token!),
    enabled,
  });
};

export const useRbacRoles = () => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["rbacRoles", gymId],
    queryFn: () => api.rbacRoles(gymId!, token!),
    enabled,
  });
};

export const useRolePermissions = (roleId?: string) => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["rolePermissions", gymId, roleId],
    queryFn: () => api.rolePermissions(gymId!, token!, roleId!),
    enabled: enabled && Boolean(roleId),
  });
};

export const useMediaComments = (mediaPostId?: string) => {
  const { token, gymId, enabled } = useSessionRequirements();
  return useQuery({
    queryKey: ["mediaComments", gymId, mediaPostId],
    queryFn: () => api.mediaComments(gymId!, token!, mediaPostId!),
    enabled: enabled && Boolean(mediaPostId),
  });
};
