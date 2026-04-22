"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useCreateSocialComment,
  useCreateSocialPost,
  useLikeSocialPost,
} from "@/hooks/use-gym-mutations";
import { useSocialPosts } from "@/hooks/use-gym-query";
import { useSessionStore } from "@/lib/session-store";

export function SocialFlow() {
  const user = useSessionStore((state) => state.user);
  const posts = useSocialPosts();
  const createPost = useCreateSocialPost();
  const createComment = useCreateSocialComment();
  const likePost = useLikeSocialPost();

  const firstPost = (posts.data ?? [])[0];

  return (
    <Card>
      <p className="text-sm text-[var(--muted)]">Flujo del área social</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          loading={createPost.isPending}
          onClick={() =>
            user?.id &&
            createPost.mutate({
              userId: user.id,
              content: "Post automático desde flujo social end-to-end",
            })
          }
        >
          Crear post
        </Button>
        <Button
          size="sm"
          variant="ghost"
          loading={likePost.isPending}
          onClick={() =>
            user?.id &&
            firstPost &&
            likePost.mutate({
              userId: user.id,
              postId: firstPost.id,
            })
          }
        >
          Like primer post
        </Button>
        <Button
          size="sm"
          variant="ghost"
          loading={createComment.isPending}
          onClick={() =>
            user?.id &&
            firstPost &&
            createComment.mutate({
              postId: firstPost.id,
              userId: user.id,
              content: "Comentario automático del flujo",
            })
          }
        >
          Comentar primer post
        </Button>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">Posts en feed: {(posts.data ?? []).length}</p>
    </Card>
  );
}
