interface TimelineItem {
  id: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

export function buildPeerTimeline(
  socialPosts: Array<{ id: string; content: string; mediaUrl?: string | null; createdAt: string }>,
  mediaPosts: Array<{ id: string; caption?: string | null; mediaUrl: string; createdAt: string }>,
): TimelineItem[] {
  const social = socialPosts.map((p) => ({
    id: p.id,
    content: p.content,
    mediaUrl: p.mediaUrl ?? undefined,
    createdAt: p.createdAt,
  }));
  const media = mediaPosts.map((post) => ({
    id: `profile-${post.id}`,
    content: post.caption ?? "Publicación de perfil",
    mediaUrl: post.mediaUrl,
    createdAt: post.createdAt,
  }));
  return [...social, ...media].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function buildOwnContent(
  socialPosts: Array<{ id: string; content: string; createdAt: string; mediaUrl?: string | null }>,
  mediaPosts: Array<{ id: string; caption?: string | null; mediaUrl: string; createdAt: string }>,
) {
  const ownProfileOnlyPosts = mediaPosts.map((post) => ({
    id: `profile-${post.id}`,
    content: post.caption ?? "Publicación de perfil",
    mediaUrl: post.mediaUrl,
    createdAt: post.createdAt,
  }));

  return [...socialPosts, ...ownProfileOnlyPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

