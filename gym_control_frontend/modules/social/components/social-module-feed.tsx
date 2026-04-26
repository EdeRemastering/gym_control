"use client";

import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { es as esLocale } from "date-fns/locale";
import { Heart, MessageCircle, MoreHorizontal, Pencil, SendHorizontal, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { normalizeSocialText, shareSocialPostToWhatsApp } from "@/modules/social/actions/social.actions";
import type { LocalCommentItem } from "@/modules/social/actions/social.interactions";

type FeedComment = {
  id: string;
  content: string;
  parentId?: string | null;
};

type FeedPost = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  mediaUrl?: string | null;
  isLiked?: boolean;
  likeCount?: number;
  postType?: string;
  comments?: FeedComment[];
  sourceGymName?: string;
};

type SocialModuleFeedProps = {
  socialView: "feed" | "explorar";
  socialTab: "publicaciones" | "logros" | "nutricion";
  setSocialTab: (value: "publicaciones" | "logros" | "nutricion") => void;
  activePostsQuery: { isPending: boolean; isError: boolean };
  tabbedFeedPosts: FeedPost[];
  visiblePosts: number;
  setVisiblePosts: (updater: (prev: number) => number) => void;
  editedContentByPost: Record<string, string>;
  openEditor: (postId: string, currentContent: string) => void;
  setPendingRemovePostId: (value: string) => void;
  isLoadingLike: Record<string, boolean>;
  localLikeState: Record<string, boolean>;
  localLikes: Record<string, number>;
  toggleLike: (postId: string, backendIsLiked: boolean, backendLikeCount: number) => Promise<void>;
  pendingPostIds: string[];
  commentsOpenByPost: Record<string, boolean>;
  setCommentsOpenByPost: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  localComments: Record<string, LocalCommentItem[]>;
  commentByPost: Record<string, string>;
  setCommentByPost: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  submitComment: (postId: string) => Promise<void>;
  replyingToByPost: Record<string, string | null>;
  setReplyingToByPost: (updater: (prev: Record<string, string | null>) => Record<string, string | null>) => void;
  replyByCommentId: Record<string, string>;
  setReplyByCommentId: (updater: (prev: Record<string, string>) => Record<string, string>) => void;
  submitReply: (postId: string, parentCommentId: string, parentCommentPersisted: boolean) => Promise<void>;
};

export function SocialModuleFeed({
  socialView,
  socialTab,
  setSocialTab,
  activePostsQuery,
  tabbedFeedPosts,
  visiblePosts,
  setVisiblePosts,
  editedContentByPost,
  openEditor,
  setPendingRemovePostId,
  isLoadingLike,
  localLikeState,
  localLikes,
  toggleLike,
  pendingPostIds,
  commentsOpenByPost,
  setCommentsOpenByPost,
  localComments,
  commentByPost,
  setCommentByPost,
  submitComment,
  replyingToByPost,
  setReplyingToByPost,
  replyByCommentId,
  setReplyByCommentId,
  submitReply,
}: SocialModuleFeedProps) {
  return (
    <>
      {socialView === "feed" ? (
        <div className="rounded-xl border border-border bg-background/35 p-1">
          <div className="grid grid-cols-3 gap-1">
            {[
              { key: "publicaciones", label: "Publicaciones" },
              { key: "logros", label: "Logros" },
              { key: "nutricion", label: "Nutricion" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSocialTab(tab.key as "publicaciones" | "logros" | "nutricion")}
                className={`min-h-10 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  socialTab === tab.key
                    ? "bg-secondary text-background shadow-[0_0_18px_color-mix(in_srgb,var(--secondary)_28%,transparent)]"
                    : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {activePostsQuery.isPending ? (
          <div className="rounded-xl border border-border bg-background/45 p-4 text-sm text-muted">Cargando publicaciones...</div>
        ) : null}
        {activePostsQuery.isError ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            No se pudieron cargar publicaciones en {socialView}.
          </div>
        ) : null}
        {!activePostsQuery.isPending && !activePostsQuery.isError && tabbedFeedPosts.length === 0 ? (
          <div className="rounded-xl border border-border bg-background/45 p-4 text-sm text-muted">
            {socialView === "feed" && socialTab !== "publicaciones"
              ? `No hay contenido para la pestaña ${socialTab}.`
              : socialView === "feed"
                ? "Todavia no hay publicaciones en tu gimnasio."
                : "No encontramos publicaciones de otros gimnasios."}
          </div>
        ) : null}
        {tabbedFeedPosts.slice(0, visiblePosts).map((post) => (
          <article key={post.id} className="social-article">
            <div className="flex items-start gap-3 border-b border-white/[0.06] px-3 py-3 md:px-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white">
                {post.userId.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {socialView === "explorar" && post.sourceGymName ? `Miembro · ${String(post.sourceGymName)}` : "Miembro Zudel OS"}
                    </p>
                    <p className="truncate text-xs text-white/45">
                      @{post.userId.slice(0, 10)}
                      {post.userId.length > 10 ? "…" : ""}
                      <span className="text-white/30"> · </span>
                      <time className="text-white/45" dateTime={post.createdAt}>
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: esLocale })}
                      </time>
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="shrink-0 rounded-full p-1.5 text-white/45 outline-none transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40"
                        aria-label="Mas opciones de la publicacion"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem
                        onSelect={() => openEditor(post.id, normalizeSocialText(editedContentByPost[post.id] ?? post.content))}
                      >
                        <Pencil className="h-4 w-4 shrink-0" />
                        Editar publicacion
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
                  <Image src={post.mediaUrl} alt="Contenido de la publicacion" width={800} height={420} className="max-h-[min(420px,70vh)] w-full object-cover" />
                </div>
              ) : null}

              <div className="flex items-center gap-1 border-t border-white/[0.06] pt-3">
                <button
                  type="button"
                  disabled={isLoadingLike[post.id]}
                  className={
                    isLoadingLike[post.id]
                      ? "inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-sm text-indigo-200"
                      : (localLikeState[post.id] ?? Boolean(post.isLiked))
                        ? "inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
                        : "inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-white"
                  }
                  onClick={() => void toggleLike(post.id, Boolean(post.isLiked), Number(post.likeCount ?? 0))}
                >
                  <Heart className={`h-[18px] w-[18px] ${(localLikeState[post.id] ?? post.isLiked) ? "fill-current" : ""}`} />
                  <span className="tabular-nums">{localLikes[post.id] ?? post.likeCount ?? 0}</span>
                </button>
                {pendingPostIds.includes(post.id) ? (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] text-amber-200">Sync</span>
                ) : null}
                <button
                  type="button"
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-sm text-white/45 hover:bg-white/5 hover:text-white"
                  onClick={() => setCommentsOpenByPost((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                >
                  <MessageCircle className="h-[18px] w-[18px]" />
                  {new Set([...(post.comments ?? []).filter((c) => !c.parentId), ...(localComments[post.id] ?? []).filter((c) => !c.parentId)].map((c) => c.id)).size}
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 py-2 text-sm text-white/45 hover:bg-white/5 hover:text-white"
                  onClick={() => shareSocialPostToWhatsApp(post.createdAt, post.mediaUrl, normalizeSocialText(editedContentByPost[post.id] ?? post.content))}
                >
                  <Share2 className="h-[18px] w-[18px]" />
                  Compartir
                </button>
              </div>

              {commentsOpenByPost[post.id] ? (
                <div className="flex items-end gap-2 rounded-xl border border-white/[0.06] bg-black/40 p-2">
                  <label className="sr-only">Comentario</label>
                  <textarea
                    value={commentByPost[post.id] ?? ""}
                    onChange={(event) => setCommentByPost((prev) => ({ ...prev, [post.id]: event.target.value }))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void submitComment(post.id);
                      }
                    }}
                    className="min-h-[40px] flex-1 resize-none bg-transparent px-1 py-1.5 text-sm text-white outline-none placeholder:text-white/35"
                    placeholder="Anade un comentario…"
                    rows={2}
                  />
                  <Button type="button" size="sm" variant="secondary" className="h-10 shrink-0 rounded-full px-3.5" onClick={() => void submitComment(post.id)}>
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </div>

            {commentsOpenByPost[post.id] && ((post.comments ?? []).length > 0 || (localComments[post.id] ?? []).length > 0) ? (
              <div className="border-t border-white/[0.06] bg-black/25 px-3 py-3 md:px-4">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/40">Comentarios</p>
                {(() => {
                  const mergedComments = [
                    ...(post.comments ?? []).map((comment) => ({
                      id: comment.id,
                      content: comment.content,
                      parentId: comment.parentId ?? null,
                      persisted: true,
                    })),
                    ...(localComments[post.id] ?? []),
                  ];

                  const renderReplies = (parentId: string, depth = 0) =>
                    mergedComments
                      .filter((reply) => reply.parentId === parentId)
                      .map((reply) => (
                        <div
                          key={reply.id}
                          className="mt-2 ml-1 rounded-lg border-l-2 border-[var(--primary)]/40 bg-white/[0.03] py-2 pl-3 pr-2"
                          style={{ marginLeft: `${Math.min(depth + 1, 4) * 10}px` }}
                        >
                          <p className="text-xs leading-relaxed text-white/85">
                            <span className="mr-1 text-white/40">↳</span>
                            {normalizeSocialText(reply.content)}
                          </p>
                          <button
                            type="button"
                            className="mt-1 text-[11px] font-medium text-[var(--primary)]/90 hover:text-[var(--primary)]"
                            onClick={() => setReplyingToByPost((prev) => ({ ...prev, [post.id]: reply.id }))}
                          >
                            Responder
                          </button>
                          {replyingToByPost[post.id] === reply.id ? (
                            <div className="mt-2 flex items-end gap-2 rounded-lg border border-white/[0.06] bg-black/40 p-2">
                              <label className="sr-only">Respuesta</label>
                              <textarea
                                value={replyByCommentId[reply.id] ?? ""}
                                onChange={(event) => setReplyByCommentId((prev) => ({ ...prev, [reply.id]: event.target.value }))}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();
                                    void submitReply(post.id, reply.id, reply.persisted);
                                  }
                                }}
                                rows={2}
                                className="min-h-[36px] flex-1 resize-none bg-transparent text-xs text-white outline-none placeholder:text-white/35"
                                placeholder="Escribe una respuesta…"
                              />
                              <Button size="sm" variant="secondary" className="shrink-0 rounded-full px-2.5" onClick={() => void submitReply(post.id, reply.id, reply.persisted)}>
                                <SendHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : null}
                          {renderReplies(reply.id, depth + 1)}
                        </div>
                      ));

                  return (
                    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                      {mergedComments
                        .filter((comment) => !comment.parentId)
                        .map((comment) => (
                          <div key={comment.id} className="rounded-xl border border-white/[0.06] bg-black/35 p-3">
                            <p className="text-sm leading-relaxed text-white/90">
                              <span className="mr-1.5 font-semibold text-[var(--primary)]">@miembro</span>
                              {normalizeSocialText(comment.content)}
                            </p>
                            <button
                              type="button"
                              className="mt-2 text-xs font-medium text-[var(--primary)]/90 hover:text-[var(--primary)]"
                              onClick={() => setReplyingToByPost((prev) => ({ ...prev, [post.id]: comment.id }))}
                            >
                              Responder
                            </button>
                            {replyingToByPost[post.id] === comment.id ? (
                              <div className="mt-2 flex items-end gap-2 rounded-lg border border-white/[0.06] bg-black/40 p-2">
                                <label className="sr-only">Respuesta</label>
                                <textarea
                                  value={replyByCommentId[comment.id] ?? ""}
                                  onChange={(event) => setReplyByCommentId((prev) => ({ ...prev, [comment.id]: event.target.value }))}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter" && !event.shiftKey) {
                                      event.preventDefault();
                                      void submitReply(post.id, comment.id, comment.persisted);
                                    }
                                  }}
                                  rows={2}
                                  className="min-h-[36px] flex-1 resize-none bg-transparent text-xs text-white outline-none placeholder:text-white/35"
                                  placeholder="Escribe una respuesta…"
                                />
                                <Button size="sm" variant="secondary" className="shrink-0 rounded-full px-2.5" onClick={() => void submitReply(post.id, comment.id, comment.persisted)}>
                                  <SendHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ) : null}
                            {renderReplies(comment.id)}
                          </div>
                        ))}
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </article>
        ))}
        {visiblePosts < tabbedFeedPosts.length ? (
          <button
            type="button"
            className="w-full rounded-full border border-white/[0.1] bg-transparent py-2.5 text-sm font-medium text-[var(--primary)] transition hover:bg-[var(--primary)]/10"
            onClick={() => setVisiblePosts((prev) => prev + 6)}
          >
            Ver mas publicaciones
          </button>
        ) : null}
      </div>
    </>
  );
}

