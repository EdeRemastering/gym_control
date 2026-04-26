import { useCreateProfileMediaPost, useCreateSocialPost } from "@/hooks/use-zudel-mutations";
import {
  useLikedSocialPosts,
  useMyProfileMediaPosts,
  useMySocialPosts,
  usePayments,
  useProfileMediaPostsForUser,
  useSocialPostsByUserId,
  useWorkoutSessions,
} from "@/hooks/use-zudel-query";
import { useProfileNavStore } from "@/lib/profile-nav-store";
import { useSessionStore } from "@/lib/session-store";
import { useUpdateProfileOptimistic } from "@/modules/profile/hooks/use-profile-optimistic";

export function useProfile() {
  const user = useSessionStore((state) => state.user);
  const profileFocusUserId = useProfileNavStore((state) => state.profileFocusUserId);
  const clearProfileFocus = useProfileNavStore((state) => state.clearProfileFocus);

  return {
    user,
    profileFocusUserId,
    clearProfileFocus,
    workouts: useWorkoutSessions(),
    payments: usePayments(),
    myPosts: useMySocialPosts(),
    myProfileMediaPosts: useMyProfileMediaPosts(),
    likedPosts: useLikedSocialPosts(),
    createPost: useCreateSocialPost(),
    createProfileMediaPost: useCreateProfileMediaPost(),
    updateProfile: useUpdateProfileOptimistic(),
    peerPosts: useSocialPostsByUserId(profileFocusUserId),
    peerMedia: useProfileMediaPostsForUser(profileFocusUserId),
  };
}
