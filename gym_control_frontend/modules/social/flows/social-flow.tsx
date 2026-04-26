"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useCreateSocialComment,
  useCreateSocialPost,
  useLikeSocialPost,
} from "@/hooks/use-zudel-mutations";
import { useSocialPosts } from "@/hooks/use-zudel-query";
import { useSessionStore } from "@/lib/session-store";

export function SocialFlow() {
  const user = useSessionStore((state) => state.user);
  const posts = useSocialPosts();
  const createPost = useCreateSocialPost();
  const createComment = useCreateSocialComment();
  const likePost = useLikeSocialPost();

  const firstPost = (posts.data ?? [])[0];

  return (
    <Card className="border-white/[0.08] bg-[#050505]/95 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">Panel lateral</p>
      <p className="mt-1 text-sm font-semibold text-white">Flujo del área social</p>
      <p className="mt-0.5 text-xs text-white/45">Atajos de prueba para el feed (misma vista).</p>
      <div className="mt-4 flex flex-wrap gap-2">
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
      <p className="mt-3 border-t border-white/[0.06] pt-3 text-xs text-white/45">
        Posts en feed: {(posts.data ?? []).length}
      </p>
    </Card>
  );
}
