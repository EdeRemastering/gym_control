"use client";

import { create } from "zustand";
import type { LocalCommentItem } from "@/modules/social/actions/social.interactions";

type Updater<T> = T | ((prev: T) => T);

function resolveUpdate<T>(prev: T, value: Updater<T>): T {
  return typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
}

type SocialModuleInteractionsStore = {
  commentByPost: Record<string, string>;
  localLikes: Record<string, number>;
  localLikeState: Record<string, boolean>;
  isLoadingLike: Record<string, boolean>;
  likeLocks: Record<string, boolean>;
  localComments: Record<string, LocalCommentItem[]>;
  replyByCommentId: Record<string, string>;
  replyingToByPost: Record<string, string | null>;
  commentsOpenByPost: Record<string, boolean>;
  editedContentByPost: Record<string, string>;
  setCommentByPost: (value: Updater<Record<string, string>>) => void;
  setLocalLikes: (value: Updater<Record<string, number>>) => void;
  setLocalLikeState: (value: Updater<Record<string, boolean>>) => void;
  setIsLoadingLike: (value: Updater<Record<string, boolean>>) => void;
  setLikeLocks: (value: Updater<Record<string, boolean>>) => void;
  setLocalComments: (value: Updater<Record<string, LocalCommentItem[]>>) => void;
  setReplyByCommentId: (value: Updater<Record<string, string>>) => void;
  setReplyingToByPost: (value: Updater<Record<string, string | null>>) => void;
  setCommentsOpenByPost: (value: Updater<Record<string, boolean>>) => void;
  setEditedContentByPost: (value: Updater<Record<string, string>>) => void;
};

export const useSocialModuleInteractionsStore = create<SocialModuleInteractionsStore>((set) => ({
  commentByPost: {},
  localLikes: {},
  localLikeState: {},
  isLoadingLike: {},
  likeLocks: {},
  localComments: {},
  replyByCommentId: {},
  replyingToByPost: {},
  commentsOpenByPost: {},
  editedContentByPost: {},
  setCommentByPost: (value) => set((state) => ({ commentByPost: resolveUpdate(state.commentByPost, value) })),
  setLocalLikes: (value) => set((state) => ({ localLikes: resolveUpdate(state.localLikes, value) })),
  setLocalLikeState: (value) => set((state) => ({ localLikeState: resolveUpdate(state.localLikeState, value) })),
  setIsLoadingLike: (value) => set((state) => ({ isLoadingLike: resolveUpdate(state.isLoadingLike, value) })),
  setLikeLocks: (value) => set((state) => ({ likeLocks: resolveUpdate(state.likeLocks, value) })),
  setLocalComments: (value) => set((state) => ({ localComments: resolveUpdate(state.localComments, value) })),
  setReplyByCommentId: (value) => set((state) => ({ replyByCommentId: resolveUpdate(state.replyByCommentId, value) })),
  setReplyingToByPost: (value) => set((state) => ({ replyingToByPost: resolveUpdate(state.replyingToByPost, value) })),
  setCommentsOpenByPost: (value) =>
    set((state) => ({ commentsOpenByPost: resolveUpdate(state.commentsOpenByPost, value) })),
  setEditedContentByPost: (value) =>
    set((state) => ({ editedContentByPost: resolveUpdate(state.editedContentByPost, value) })),
}));

