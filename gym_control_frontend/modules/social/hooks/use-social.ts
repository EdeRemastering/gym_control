import { useExploreSocialPosts, useGyms, useSocialPosts } from "@/hooks/use-zudel-query";
import { useSessionStore } from "@/lib/session-store";
import {
  useCreateSocialCommentOptimistic,
  useCreateSocialPostOptimistic,
  useFlushSocialQueue,
  useLikeSocialPostOptimistic,
  useSocialSyncStore,
} from "@/modules/social/hooks/use-social-optimistic";

export function useSocial() {
  useFlushSocialQueue();
  return {
    currentUser: useSessionStore((state) => state.user),
    gyms: useGyms(),
    postsQuery: useSocialPosts(),
    explorePostsQuery: useExploreSocialPosts(),
    createPost: useCreateSocialPostOptimistic(),
    createComment: useCreateSocialCommentOptimistic(),
    likePost: useLikeSocialPostOptimistic(),
    pendingPostIds: useSocialSyncStore((state) => state.pendingPostIds),
  };
}
