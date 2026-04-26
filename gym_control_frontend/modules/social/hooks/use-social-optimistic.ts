"use client";

import { useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { api } from "@/lib/api/services";
import { useSessionStore } from "@/lib/session-store";
import type { SocialPost } from "@/lib/types";

type SessionCtx = { token: string; gymId: string };
type SocialQueueIntent =
  | { id: string; kind: "CREATE_POST"; payload: { userId: string; content: string; mediaUrl?: string; postType?: "PUBLICATION" | "ACHIEVEMENT" | "NUTRITION" } }
  | { id: string; kind: "LIKE_POST"; payload: { userId: string; postId: string } }
  | { id: string; kind: "COMMENT"; payload: { postId: string; userId: string; content: string; parentId?: string } };

type SocialSyncStore = {
  pendingPostIds: string[];
  queue: SocialQueueIntent[];
  logs: string[];
  startPending: (postId: string) => void;
  endPending: (postId: string) => void;
  enqueue: (intent: SocialQueueIntent) => void;
  dequeue: (intentId: string) => void;
  log: (line: string) => void;
};

export const useSocialSyncStore = create<SocialSyncStore>()(
  persist(
    (set) => ({
      pendingPostIds: [],
      queue: [],
      logs: [],
      startPending: (postId) =>
        set((s) => ({
          pendingPostIds: s.pendingPostIds.includes(postId) ? s.pendingPostIds : [...s.pendingPostIds, postId],
        })),
      endPending: (postId) =>
        set((s) => ({
          pendingPostIds: s.pendingPostIds.filter((id) => id !== postId),
        })),
      enqueue: (intent) =>
        set((s) => ({
          queue: [...s.queue, intent],
          logs: [...s.logs, `Encolado social: ${intent.id}`].slice(-100),
        })),
      dequeue: (intentId) =>
        set((s) => ({
          queue: s.queue.filter((item) => item.id !== intentId),
        })),
      log: (line) =>
        set((s) => ({
          logs: [...s.logs, line].slice(-100),
        })),
    }),
    { name: "social-sync-store", partialize: (s) => ({ queue: s.queue, logs: s.logs }) },
  ),
);

function getSessionValues(): SessionCtx {
  const session = useSessionStore.getState();
  if (!session.accessToken || !session.user?.gymId) {
    throw new Error("Sesion no disponible");
  }
  return { token: session.accessToken, gymId: session.user.gymId };
}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 2, baseMs = 300): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, baseMs * 2 ** attempt));
    }
  }
  throw lastError;
}

export function useCreateSocialPostOptimistic() {
  const queryClient = useQueryClient();
  const syncStore = useSocialSyncStore.getState();

  return useMutation({
    mutationFn: async (payload: { userId: string; content: string; mediaUrl?: string; postType?: "PUBLICATION" | "ACHIEVEMENT" | "NUTRITION" }) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const id = `offline-post-${Date.now()}`;
        syncStore.enqueue({ id, kind: "CREATE_POST", payload });
        return {
          id: `temp-post-${Date.now()}`,
          userId: payload.userId,
          content: payload.content,
          mediaUrl: payload.mediaUrl ?? null,
          postType: payload.postType ?? "PUBLICATION",
          createdAt: new Date().toISOString(),
          likeCount: 0,
          isLiked: false,
        };
      }
      const session = getSessionValues();
      return retryWithBackoff(() => api.createSocialPost(session.gymId, session.token, payload));
    },
    onMutate: async (payload) => {
      const session = getSessionValues();
      const previous = queryClient.getQueriesData<SocialPost[]>({ queryKey: ["socialPosts"] });
      await queryClient.cancelQueries({ queryKey: ["socialPosts", session.gymId] });
      const tempId = `temp-post-${Date.now()}`;
      syncStore.startPending(tempId);
      queryClient.setQueriesData<SocialPost[]>({ queryKey: ["socialPosts"] }, (old = []) => [
        {
          id: tempId,
          userId: payload.userId,
          content: payload.content,
          mediaUrl: payload.mediaUrl ?? null,
          postType: payload.postType ?? "PUBLICATION",
          createdAt: new Date().toISOString(),
          likeCount: 0,
          isLiked: false,
        },
        ...old,
      ]);
      return { previous, tempId };
    },
    onError: (_error, _payload, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context?.tempId) syncStore.endPending(context.tempId);
      toast.error("No se pudo publicar. Se revirtio el feed.");
    },
    onSuccess: (result, _payload, context) => {
      queryClient.setQueriesData<SocialPost[]>({ queryKey: ["socialPosts"] }, (old = []) =>
        old.map((post) => (post.id === context?.tempId ? result : post)),
      );
    },
    onSettled: (_result, _error, _payload, context) => {
      if (context?.tempId) syncStore.endPending(context.tempId);
      queryClient.invalidateQueries({ queryKey: ["socialPosts"] });
    },
  });
}

export function useLikeSocialPostOptimistic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { userId: string; postId: string }) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        useSocialSyncStore.getState().enqueue({
          id: `offline-like-${payload.postId}-${Date.now()}`,
          kind: "LIKE_POST",
          payload,
        });
        return { postId: payload.postId, userId: payload.userId, isLiked: true, likeCount: 0 };
      }
      const session = getSessionValues();
      return retryWithBackoff(() => api.likePost(session.gymId, session.token, payload.postId, payload.userId));
    },
    onMutate: async (payload) => {
      const previous = queryClient.getQueriesData<SocialPost[]>({ queryKey: ["socialPosts"] });
      await queryClient.cancelQueries({ queryKey: ["socialPosts"] });
      queryClient.setQueriesData<SocialPost[]>({ queryKey: ["socialPosts"] }, (old = []) =>
        old.map((post) => {
          if (post.id !== payload.postId) return post;
          const currentlyLiked = Boolean(post.isLiked);
          return {
            ...post,
            isLiked: !currentlyLiked,
            likeCount: Math.max(0, Number(post.likeCount ?? 0) + (currentlyLiked ? -1 : 1)),
          };
        }),
      );
      return { previous };
    },
    onError: (_error, _payload, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error("No se pudo actualizar el like.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["socialPosts"] });
    },
  });
}

export function useCreateSocialCommentOptimistic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { postId: string; userId: string; content: string; parentId?: string }) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        useSocialSyncStore.getState().enqueue({
          id: `offline-comment-${payload.postId}-${Date.now()}`,
          kind: "COMMENT",
          payload,
        });
        return {
          id: `temp-comment-${Date.now()}`,
          postId: payload.postId,
          userId: payload.userId,
          content: payload.content,
          parentId: payload.parentId ?? null,
          createdAt: new Date().toISOString(),
        };
      }
      const session = getSessionValues();
      return retryWithBackoff(() => api.createSocialComment(session.gymId, session.token, payload));
    },
    onMutate: async (payload) => {
      const previous = queryClient.getQueriesData<SocialPost[]>({ queryKey: ["socialPosts"] });
      await queryClient.cancelQueries({ queryKey: ["socialPosts"] });
      queryClient.setQueriesData<SocialPost[]>({ queryKey: ["socialPosts"] }, (old = []) =>
        old.map((post) =>
          post.id === payload.postId
            ? {
                ...post,
                comments: [
                  ...(post.comments ?? []),
                  {
                    id: `temp-comment-${Date.now()}`,
                    postId: payload.postId,
                    userId: payload.userId,
                    content: payload.content,
                    parentId: payload.parentId ?? null,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : post,
        ),
      );
      return { previous };
    },
    onError: (_error, _payload, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error("No se pudo publicar el comentario.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["socialPosts"] });
    },
  });
}

export function useFlushSocialQueue() {
  const queue = useSocialSyncStore((s) => s.queue);
  const dequeue = useSocialSyncStore((s) => s.dequeue);
  const log = useSocialSyncStore((s) => s.log);
  const queryClient = useQueryClient();

  const flushQueue = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    const session = getSessionValues();
    for (const intent of queue) {
      try {
        if (intent.kind === "CREATE_POST") {
          await retryWithBackoff(() => api.createSocialPost(session.gymId, session.token, intent.payload));
        }
        if (intent.kind === "LIKE_POST") {
          await retryWithBackoff(() =>
            api.likePost(session.gymId, session.token, intent.payload.postId, intent.payload.userId),
          );
        }
        if (intent.kind === "COMMENT") {
          await retryWithBackoff(() => api.createSocialComment(session.gymId, session.token, intent.payload));
        }
        dequeue(intent.id);
        log(`Procesado social: ${intent.id}`);
      } catch {
        log(`Fallo social: ${intent.id}`);
      }
    }
    queryClient.invalidateQueries({ queryKey: ["socialPosts"] });
  }, [dequeue, log, queryClient, queue]);

  useEffect(() => {
    void flushQueue();
    function onOnline() {
      void flushQueue();
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flushQueue]);
}

