import { useSocialPosts } from "@/hooks/use-gym-query";

export function useSocial() {
  return { postsQuery: useSocialPosts() };
}
