import { usePayments, useSocialPosts, useWorkoutSessions } from "@/hooks/use-gym-query";

export function useProfile() {
  return {
    workoutsQuery: useWorkoutSessions(),
    paymentsQuery: usePayments(),
    postsQuery: useSocialPosts(),
  };
}
