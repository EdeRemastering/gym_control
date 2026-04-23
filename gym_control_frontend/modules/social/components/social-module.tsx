"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { es as esLocale } from "date-fns/locale";
import {
  Heart,
  ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  PlusSquare,
  SendHorizontal,
  Share2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCreateSocialComment,
  useCreateSocialPost,
  useLikeSocialPost,
} from "@/hooks/use-gym-mutations";
import { useSocialPosts } from "@/hooks/use-gym-query";
import type { ModuleShellProps } from "@/lib/module-shell-props";
import { useSessionStore } from "@/lib/session-store";
import type { SocialPost } from "@/lib/types";
import { SocialFlow } from "@/modules/social/flows/social-flow";

function shareSocialPostToWhatsApp(post: SocialPost, displayContent: string) {
  const body = displayContent.trim().slice(0, 3500);
  const parts = ["📣 Gym Control — Área social", "", body];
  if (post.mediaUrl) parts.push("", post.mediaUrl);
  parts.push("", `— ${new Date(post.createdAt).toLocaleString("es")}`);
  const url = `https://wa.me/?text=${encodeURIComponent(parts.join("\n"))}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

interface LocalCommentItem {
  id: string;
  content: string;
  parentId: string | null;
  persisted: boolean;
}

export function SocialModule({ role, onOpenMemberProfile }: ModuleShellProps) {
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

  const storyUserIds = useMemo(() => {
    const ids = new Set<string>();
    if (currentUser?.id) ids.add(currentUser.id);
    visibleFeedPosts.forEach((p) => ids.add(p.userId));
    return Array.from(ids).slice(0, 14);
  }, [visibleFeedPosts, currentUser]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
      <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#050505]/95 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] md:p-5">
        <header className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">Feed</p>
            <h2 className="text-lg font-semibold tracking-tight text-white">Social Gym</h2>
            <p className="mt-0.5 text-xs text-white/50">Publicaciones del gimnasio · rol {role}</p>
          </div>
        </header>

        {storyUserIds.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-white/[0.08] bg-black/40 px-3 py-3">
            <p className="mb-3 px-1 text-[11px] font-medium uppercase tracking-wide text-white/40">
              Miembros activos
            </p>
            <div className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {storyUserIds.map((userId) => {
                const isSelf = currentUser?.id === userId;
                const initials = userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "GC";
                const label = isSelf ? "Tú" : userId.slice(0, 8);
                return (
                  <button
                    key={userId}
                    type="button"
                    onClick={() => onOpenMemberProfile?.(userId)}
                    className="group flex shrink-0 flex-col items-center gap-1.5 rounded-xl border border-transparent p-1 text-left transition hover:border-white/10 hover:bg-white/[0.04] focus-visible:border-[var(--primary)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30"
                    aria-label={isSelf ? "Ver tu perfil y última publicación" : `Ver perfil de ${userId} y su última publicación`}
                  >
                    <div className="rounded-full bg-gradient-to-tr from-fuchsia-500 via-orange-400 to-yellow-300 p-[2px] transition group-hover:brightness-110">
                      <div className="rounded-full bg-black p-[2px]">
                        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white">
                          {initials}
                        </div>
                      </div>
                    </div>
                    <span className="max-w-[4.25rem] truncate text-center text-[11px] text-white/65 group-hover:text-white/85">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <form
          className="mt-4 rounded-2xl border border-white/[0.08] bg-black/35 p-3 md:p-4"
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
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/50 px-3 py-2.5 text-sm leading-relaxed text-white outline-none ring-0 placeholder:text-white/35 focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/30"
            placeholder="¿Qué entrenaste hoy?"
            rows={3}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="submit"
              size="sm"
              loading={createPost.isPending}
              className="rounded-full px-4"
            >
              <PlusSquare className="h-4 w-4" />
              Publicar
            </Button>
            <Button type="button" size="sm" variant="secondary" className="rounded-full" onClick={onCreateDemoPost}>
              <ImageIcon className="h-4 w-4" />
              Demo con foto
            </Button>
          </div>
        </form>

        <div className="mt-5 space-y-4">
          {visibleFeedPosts.slice(0, visiblePosts).map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/30"
            >
              <div className="flex items-start gap-3 border-b border-white/[0.06] px-3 py-3 md:px-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white">
                  {post.userId.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">Miembro Gym Control</p>
                      <p className="truncate text-xs text-white/45">
                        @{post.userId.slice(0, 10)}
                        {post.userId.length > 10 ? "…" : ""}
                        <span className="text-white/30"> · </span>
                        <time className="text-white/45" dateTime={post.createdAt}>
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                            locale: esLocale,
                          })}
                        </time>
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="shrink-0 rounded-full p-1.5 text-white/45 outline-none transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40"
                          aria-label="Más opciones de la publicación"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          onSelect={() =>
                            shareSocialPostToWhatsApp(
                              post,
                              normalizeSocialText(editedContentByPost[post.id] ?? post.content),
                            )
                          }
                        >
                          <Share2 className="h-4 w-4 shrink-0" />
                          Compartir en WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() =>
                            openEditor(
                              post.id,
                              normalizeSocialText(editedContentByPost[post.id] ?? post.content),
                            )
                          }
                        >
                          <Pencil className="h-4 w-4 shrink-0" />
                          Editar publicación
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-rose-300 focus:bg-rose-500/15 focus:text-rose-200"
                          onSelect={() => setPendingRemovePostId(post.id)}
                        >
                          <Trash2 className="h-4 w-4 shrink-0" />
                          Quitar del feed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-3 py-3 md:px-4 md:py-4">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-white/95">
                  {normalizeSocialText(editedContentByPost[post.id] ?? post.content)}
                </p>
                {post.mediaUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
                    <Image
                      src={post.mediaUrl}
                      alt="Contenido de la publicación"
                      width={800}
                      height={420}
                      className="max-h-[min(420px,70vh)] w-full object-cover"
                    />
                  </div>
                ) : null}

                <div className="flex items-center gap-1 border-t border-white/[0.06] pt-3">
                  <button
                    type="button"
                    disabled={isLoadingLike[post.id]}
                    className={
                      isLoadingLike[post.id]
                        ? "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-indigo-200"
                        : (localLikeState[post.id] ?? post.isLiked)
                          ? "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-rose-300 hover:bg-rose-500/10"
                          : "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-white/50 hover:bg-white/5 hover:text-white"
                    }
                    onClick={() =>
                      void toggleLike(post.id, Boolean(post.isLiked), Number(post.likeCount ?? 0))
                    }
                  >
                    <Heart
                      className={`h-[18px] w-[18px] ${
                        (localLikeState[post.id] ?? post.isLiked) ? "fill-current" : ""
                      }`}
                    />
                    <span className="tabular-nums">{localLikes[post.id] ?? post.likeCount ?? 0}</span>
                  </button>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm text-white/45">
                    <MessageCircle className="h-[18px] w-[18px]" />
                    {new Set(
                      [
                        ...(post.comments ?? []).filter((c) => !c.parentId),
                        ...(localComments[post.id] ?? []).filter((c) => !c.parentId),
                      ].map((c) => c.id),
                    ).size}
                  </span>
                </div>

                <div className="flex items-end gap-2 rounded-xl border border-white/[0.06] bg-black/40 p-2">
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
                    className="min-h-[40px] flex-1 resize-none bg-transparent px-1 py-1.5 text-sm text-white outline-none placeholder:text-white/35"
                    placeholder="Añade un comentario…"
                    rows={2}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="shrink-0 rounded-full px-3"
                    onClick={() => void submitComment(post.id)}
                  >
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {((post.comments ?? []).length > 0 || (localComments[post.id] ?? []).length > 0) ? (
                <div className="border-t border-white/[0.06] bg-black/25 px-3 py-3 md:px-4">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/40">Comentarios</p>
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
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
                        <div
                          key={comment.id}
                          className="rounded-xl border border-white/[0.06] bg-black/35 p-3"
                        >
                          <p className="text-sm leading-relaxed text-white/90">
                            <span className="mr-1.5 font-semibold text-[var(--primary)]">@miembro</span>
                            {normalizeSocialText(comment.content)}
                          </p>
                          <button
                            type="button"
                            className="mt-2 text-xs font-medium text-[var(--primary)]/90 hover:text-[var(--primary)]"
                            onClick={() =>
                              setReplyingToByPost((prev) => ({ ...prev, [post.id]: comment.id }))
                            }
                          >
                            Responder
                          </button>
                          {replyingToByPost[post.id] === comment.id ? (
                            <div className="mt-2 flex items-end gap-2 rounded-lg border border-white/[0.06] bg-black/40 p-2">
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
                                className="min-h-[36px] flex-1 resize-none bg-transparent text-xs text-white outline-none placeholder:text-white/35"
                                placeholder="Escribe una respuesta…"
                              />
                              <Button
                                size="sm"
                                variant="secondary"
                                className="shrink-0 rounded-full px-2.5"
                                onClick={() => void submitReply(post.id, comment.id)}
                              >
                                <SendHorizontal className="h-3.5 w-3.5" />
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
                              <div
                                key={reply.id}
                                className="mt-2 ml-1 rounded-lg border-l-2 border-[var(--primary)]/40 bg-white/[0.03] py-2 pl-3 pr-2"
                              >
                                <p className="text-xs leading-relaxed text-white/85">
                                  <span className="mr-1 text-white/40">↳</span>
                                  {normalizeSocialText(reply.content)}
                                </p>
                              </div>
                            ))}
                        </div>
                      ))}
                  </div>
                </div>
              ) : null}
            </article>
          ))}
          {visiblePosts < visibleFeedPosts.length ? (
            <button
              type="button"
              className="w-full rounded-full border border-white/[0.1] bg-transparent py-2.5 text-sm font-medium text-[var(--primary)] transition hover:bg-[var(--primary)]/10"
              onClick={() => setVisiblePosts((prev) => prev + 6)}
            >
              Ver más publicaciones
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
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
