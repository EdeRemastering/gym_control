import type { SocialPost } from "@/lib/types";

export function sortPostsByDateDesc(posts: SocialPost[]): SocialPost[] {
  return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function selectVisibleFeedPosts(posts: SocialPost[], hiddenPosts: string[]): SocialPost[] {
  return posts.filter((post) => !hiddenPosts.includes(post.id));
}

export function selectStoryUserIds(posts: SocialPost[], currentUserId?: string): string[] {
  const ids = new Set<string>();
  if (currentUserId) ids.add(currentUserId);
  posts.forEach((p) => ids.add(p.userId));
  return Array.from(ids).slice(0, 14);
}

