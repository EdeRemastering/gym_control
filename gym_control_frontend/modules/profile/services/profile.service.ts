import { api } from "@/lib/api/services";

export const profileService = {
  workouts: api.workoutSessions,
  payments: api.payments,
  posts: api.socialPosts,
};
