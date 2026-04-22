"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Heart, ImageIcon, MessageCircle, Pencil, PlusSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateSocialComment,
  useCreateSocialPost,
  useLikeSocialPost,
} from "@/hooks/use-gym-mutations";
import { useSocialPosts } from "@/hooks/use-gym-query";
import { useSessionStore } from "@/lib/session-store";
import type { Role } from "@/lib/types";
import { SocialFlow } from "@/modules/social/flows/social-flow";

interface LocalCommentItem {
  id: string;
  content: string;
  parentId: string | null;
  persisted: boolean;
}

export function SocialModule({ role }: { role: Role }) {
  const currentUser = useSessionStore((state) => state.user);
  const posts = useSocialPosts();
  const createPost = useCreateSocialPost();
  const createComment = useCreateSocialComment();
  const likePost = useLikeSocialPost();
  const [postContent, setPostContent] = useState("");
  const [commentByPost, setCommentByPost] = useState<Record<string, string>>({});
  const [localLikes, setLocalLikes] = useState<Record<string, number>>({});
  const [localLikeState, setLocalLikeState] = useState<Record<string, boolean>>({});
  const [isLoadingLike, setIsLoadingLike] = useState<Record<string, boolean>>({});
  const likeLocksRef = useRef<Record<string, boolean>>({});
  const optimisticCounterRef = useRef(0);
  const [localComments, setLocalComments] = useState<Record<string, LocalCommentItem[]>>({});
  const [replyByCommentId, setReplyByCommentId] = useState<Record<string, string>>({});
  const [replyingToByPost, setReplyingToByPost] = useState<Record<string, string | null>>({});
  const [editedContentByPost, setEditedContentByPost] = useState<Record<string, string>>({});
  const [visiblePosts, setVisiblePosts] = useState(8);
  const [hiddenPosts, setHiddenPosts] = useState<string[]>([]);
  const [pendingRemovePostId, setPendingRemovePostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const demoImageUrl =
    "https://images.unsplash.com/photo-1571732154690-f6d1c3e5178a?auto=format&fit=crop&w=1400&q=80";
  const sortedPosts = useMemo(
    () =>
      [...(posts.data ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [posts.data],
  );

  async function submitPost() {
    if (!currentUser?.id || !postContent.trim()) return;
    await createPost.mutateAsync({
      userId: currentUser.id,
      content: postContent,
    });
    setPostContent("");
  }

  async function onCreatePost(event: FormEvent) {
    event.preventDefault();
    await submitPost();
  }

  async function onCreateDemoPost() {
    if (!currentUser?.id) return;
    await createPost.mutateAsync({
      userId: currentUser.id,
      content: "Entrenamiento full body terminado. Mejorando técnica, fuerza y resistencia 💪",
      mediaUrl: demoImageUrl,
    });
  }

  async function submitComment(postId: string) {
    if (postId.startsWith("post-")) {
      toast.error("Espera a que la publicación termine de guardarse");
      return;
    }
    const content = commentByPost[postId];
    if (!currentUser?.id || !content?.trim()) return;
    optimisticCounterRef.current += 1;
    const optimisticId = `optimistic-${optimisticCounterRef.current}`;
    const optimisticComment: LocalCommentItem = {
      id: optimisticId,
      content,
      parentId: null,
      persisted: false,
    };
    setLocalComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] ?? []), optimisticComment],
    }));
    setCommentByPost((prev) => ({ ...prev, [postId]: "" }));
    try {
      await createComment.mutateAsync({
        postId,
        userId: currentUser.id,
        content,
      });
      setLocalComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? []).filter((comment) => comment.id !== optimisticId),
      }));
    } catch {
      setLocalComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? []).filter((comment) => comment.id !== optimisticId),
      }));
      toast.error("No se pudo publicar el comentario");
    }
  }

  async function submitReply(postId: string, parentCommentId: string) {
    if (postId.startsWith("post-")) {
      toast.error("Espera a que la publicación termine de guardarse");
      return;
    }
    const parentComment = (localComments[postId] ?? []).find((comment) => comment.id === parentCommentId);
    if (!parentComment?.persisted) {
      toast.error("Espera un momento antes de responder");
      return;
    }
    const content = replyByCommentId[parentCommentId];
    if (!currentUser?.id || !content?.trim()) return;
    optimisticCounterRef.current += 1;
    const optimisticId = `optimistic-${optimisticCounterRef.current}`;
    const optimisticReply: LocalCommentItem = {
      id: optimisticId,
      content,
      parentId: parentCommentId,
      persisted: false,
    };
    setLocalComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] ?? []), optimisticReply],
    }));
    setReplyByCommentId((prev) => ({ ...prev, [parentCommentId]: "" }));
    setReplyingToByPost((prev) => ({ ...prev, [postId]: null }));
    try {
      await createComment.mutateAsync({
        postId,
        userId: currentUser.id,
        parentId: parentCommentId,
        content,
      });
      setLocalComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? []).filter((comment) => comment.id !== optimisticId),
      }));
    } catch {
      setLocalComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? []).filter((comment) => comment.id !== optimisticId),
      }));
      toast.error("No se pudo publicar la respuesta");
    }
  }

  function normalizeSocialText(value: string) {
    const cleaned = value.replace(/^\?\?\s*/, "");
    const maybeMojibake = /[ÃÂâ]/.test(cleaned);
    if (!maybeMojibake) return cleaned;
    try {
      const bytes = Uint8Array.from(cleaned, (char) => char.charCodeAt(0));
      return new TextDecoder("utf-8").decode(bytes);
    } catch {
      return cleaned;
    }
  }

  async function toggleLike(postId: string, backendIsLiked: boolean, backendLikeCount: number) {
    if (!currentUser?.id || likeLocksRef.current[postId]) return;
    likeLocksRef.current[postId] = true;
    const prevIsLiked = localLikeState[postId] ?? backendIsLiked;
    const prevLikeCount = localLikes[postId] ?? backendLikeCount;
    const nextIsLiked = !prevIsLiked;
    const nextLikeCount = Math.max(0, prevLikeCount + (nextIsLiked ? 1 : -1));

    setIsLoadingLike((prev) => ({ ...prev, [postId]: true }));
    setLocalLikeState((prev) => ({ ...prev, [postId]: nextIsLiked }));
    setLocalLikes((prev) => ({ ...prev, [postId]: nextLikeCount }));

    try {
      const response = await likePost.mutateAsync({ postId, userId: currentUser.id });
      setLocalLikeState((prev) => ({ ...prev, [postId]: response.isLiked }));
      setLocalLikes((prev) => ({ ...prev, [postId]: response.likeCount }));
    } catch {
      setLocalLikeState((prev) => ({ ...prev, [postId]: prevIsLiked }));
      setLocalLikes((prev) => ({ ...prev, [postId]: prevLikeCount }));
    } finally {
      setIsLoadingLike((prev) => ({ ...prev, [postId]: false }));
      likeLocksRef.current[postId] = false;
    }
  }

  function openEditor(postId: string, currentContent: string) {
    setEditingPostId(postId);
    setEditingValue(currentContent);
  }

  const visibleFeedPosts = sortedPosts.filter((post) => !hiddenPosts.includes(post.id));
  const pendingRemovePost = visibleFeedPosts.find((post) => post.id === pendingRemovePostId) ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted)]">Feed social Gym Control</p>
          <span className="text-xs text-[var(--muted)]">Rol: {role}</span>
        </div>
        <form
          className="mt-3 rounded-2xl border border-[var(--border)] bg-white/[0.03] p-3"
          onSubmit={onCreatePost}
        >
          <textarea
            value={postContent}
            onChange={(event) => setPostContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submitPost();
              }
            }}
            className="w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
            placeholder="¿Qué entrenaste hoy?"
            rows={3}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="submit" size="sm" loading={createPost.isPending}>
              <PlusSquare className="h-4 w-4" />
              Publicar texto
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={onCreateDemoPost}>
              <ImageIcon className="h-4 w-4" />
              Crear post demo con foto
            </Button>
          </div>
        </form>
        <div className="mt-4 space-y-3">
          {visibleFeedPosts
            .slice(0, visiblePosts)
            .map((post) => (
            <article key={post.id} className="rounded-2xl border border-[var(--border)] bg-white/[0.04] p-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/20 text-xs font-semibold text-[var(--primary)]">
                  {post.userId.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Miembro Gym Control</p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-white">
                {normalizeSocialText(editedContentByPost[post.id] ?? post.content)}
              </p>
              {post.mediaUrl ? (
                <div className="mt-2 overflow-hidden rounded-xl border border-[var(--border)]">
                  <Image
                    src={post.mediaUrl}
                    alt="media post"
                    width={800}
                    height={420}
                    className="h-64 w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isLoadingLike[post.id]}
                  className={
                    isLoadingLike[post.id]
                      ? "bg-indigo-500/20 text-indigo-200"
                      : (localLikeState[post.id] ?? post.isLiked)
                        ? "bg-rose-500/20 text-rose-200"
                        : "bg-white/5 text-[var(--muted)]"
                  }
                  onClick={() =>
                    void toggleLike(post.id, Boolean(post.isLiked), Number(post.likeCount ?? 0))
                  }
                >
                  <Heart
                    className={`h-4 w-4 ${
                      (localLikeState[post.id] ?? post.isLiked) ? "fill-current" : ""
                    }`}
                  />
                  {localLikes[post.id] ?? post.likeCount ?? 0}
                </Button>
                <div className="flex flex-1 items-center gap-2">
                  <textarea
                    value={commentByPost[post.id] ?? ""}
                    onChange={(event) =>
                      setCommentByPost((prev) => ({
                        ...prev,
                        [post.id]: event.target.value,
                      }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void submitComment(post.id);
                      }
                    }}
                    className="flex-1 rounded-lg border border-[var(--border)] bg-black/20 p-2 text-xs text-white"
                    placeholder="Comentar..."
                    rows={2}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void submitComment(post.id)}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <footer className="mt-3 flex items-center justify-end gap-1 border-t border-[var(--border)] pt-2">
                <button
                  type="button"
                  title="Editar"
                  aria-label="Editar publicación"
                  className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-white/10 hover:text-white"
                  onClick={() =>
                    openEditor(post.id, normalizeSocialText(editedContentByPost[post.id] ?? post.content))
                  }
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Quitar"
                  aria-label="Quitar publicación"
                  className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-white/10 hover:text-[var(--danger)]"
                  onClick={() => {
                    setPendingRemovePostId(post.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </footer>
              {((post.comments ?? []).length > 0 || (localComments[post.id] ?? []).length > 0) ? (
                <div className="mt-2 max-h-72 space-y-1 overflow-y-auto rounded-lg border border-[var(--border)] bg-black/20 p-2 pr-1">
                  {[
                    ...(post.comments ?? []).map((comment) => ({
                      id: comment.id,
                      content: comment.content,
                      parentId: comment.parentId ?? null,
                      persisted: true,
                    })),
                    ...(localComments[post.id] ?? []),
                  ]
                    .filter((comment) => !comment.parentId)
                    .map((comment) => (
                      <div key={comment.id} className="space-y-1 rounded-md bg-white/5 p-2">
                        <p className="text-xs text-white/90">
                          <span className="mr-1 text-[var(--muted)]">usuario:</span>
                          {normalizeSocialText(comment.content)}
                        </p>
                        <button
                          type="button"
                          className="text-[10px] text-indigo-300 hover:text-indigo-200"
                          onClick={() =>
                            setReplyingToByPost((prev) => ({ ...prev, [post.id]: comment.id }))
                          }
                        >
                          Responder
                        </button>
                        {replyingToByPost[post.id] === comment.id ? (
                          <div className="mt-1 flex items-center gap-2">
                            <textarea
                              value={replyByCommentId[comment.id] ?? ""}
                              onChange={(event) =>
                                setReplyByCommentId((prev) => ({
                                  ...prev,
                                  [comment.id]: event.target.value,
                                }))
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                  event.preventDefault();
                                  void submitReply(post.id, comment.id);
                                }
                              }}
                              rows={2}
                              className="flex-1 rounded-lg border border-[var(--border)] bg-black/30 p-2 text-xs text-white"
                              placeholder="Responder comentario..."
                            />
                            <Button size="sm" variant="secondary" onClick={() => void submitReply(post.id, comment.id)}>
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : null}
                        {[
                          ...(post.comments ?? []).map((reply) => ({
                            id: reply.id,
                            content: reply.content,
                            parentId: reply.parentId ?? null,
                            persisted: true,
                          })),
                          ...(localComments[post.id] ?? []),
                        ]
                          .filter((reply) => reply.parentId === comment.id)
                          .map((reply) => (
                            <div key={reply.id} className="ml-4 rounded-md border border-[var(--border)] bg-black/20 p-2">
                              <p className="text-xs text-white/90">
                                <span className="mr-1 text-[var(--muted)]">respuesta:</span>
                                {normalizeSocialText(reply.content)}
                              </p>
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              ) : null}
            </article>
          ))}
          {visiblePosts < sortedPosts.length ? (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setVisiblePosts((prev) => prev + 6)}
            >
              Ver más publicaciones
            </Button>
          ) : null}
        </div>
      </Card>

      <div className="lg:col-span-3">
        <SocialFlow />
      </div>

      <AlertDialog
        open={Boolean(pendingRemovePost)}
        onOpenChange={(open) => {
          if (!open) setPendingRemovePostId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitar publicación</AlertDialogTitle>
            <AlertDialogDescription>
              Esta publicación dejará de verse en el feed. Podrás restaurarla desde el panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingRemovePost) return;
                setHiddenPosts((prev) => [...prev, pendingRemovePost.id]);
                setPendingRemovePostId(null);
              }}
            >
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={Boolean(editingPostId)} onOpenChange={(open) => !open && setEditingPostId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar publicación</DialogTitle>
            <DialogDescription>Actualiza el texto de la publicación.</DialogDescription>
          </DialogHeader>
          <textarea
            value={editingValue}
            onChange={(event) => setEditingValue(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white/5 p-2 text-sm text-white"
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditingPostId(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!editingPostId || !editingValue.trim()) return;
                setEditedContentByPost((prev) => ({ ...prev, [editingPostId]: editingValue.trim() }));
                setEditingPostId(null);
              }}
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
