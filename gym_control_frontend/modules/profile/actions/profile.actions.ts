export const profileActionCatalog = [
  "edit_profile",
  "change_avatar",
  "set_visibility",
  "link_social_account",
] as const;

interface CreatePersonalPostParams {
  userId: string;
  content: string;
  mediaUrl: string;
  alsoShareInSocial: boolean;
  createPost: (args: { userId: string; content: string; mediaUrl?: string }) => Promise<unknown>;
  createProfileMediaPost: (args: { userId: string; type: "IMAGE"; mediaUrl: string; caption: string }) => Promise<unknown>;
}

export async function createPersonalPostAction({
  userId,
  content,
  mediaUrl,
  alsoShareInSocial,
  createPost,
  createProfileMediaPost,
}: CreatePersonalPostParams): Promise<"social_and_profile" | "profile_only"> {
  const trimmedContent = content.trim();
  const trimmedMediaUrl = mediaUrl.trim();

  if (alsoShareInSocial) {
    await createPost({
      userId,
      content: trimmedContent,
      mediaUrl: trimmedMediaUrl || undefined,
    });
    return "social_and_profile";
  }

  if (!trimmedMediaUrl) {
    throw new Error("MISSING_PROFILE_MEDIA_URL");
  }

  await createProfileMediaPost({
    userId,
    type: "IMAGE",
    mediaUrl: trimmedMediaUrl,
    caption: trimmedContent,
  });
  return "profile_only";
}
