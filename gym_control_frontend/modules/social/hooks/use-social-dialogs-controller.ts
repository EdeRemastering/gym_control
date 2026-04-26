"use client";

import { useSocialModuleInteractionsStore } from "@/modules/social/store/use-social-module-interactions-store";
import { useSocialModuleUiStore } from "@/modules/social/store/use-social-module-ui-store";

type FeedPost = {
  id: string;
};

export function useSocialDialogsController(visibleFeedPosts: FeedPost[]) {
  const pendingRemovePostId = useSocialModuleUiStore((state) => state.pendingRemovePostId);
  const setPendingRemovePostId = useSocialModuleUiStore((state) => state.setPendingRemovePostId);
  const setHiddenPosts = useSocialModuleUiStore((state) => state.setHiddenPosts);
  const editingPostId = useSocialModuleUiStore((state) => state.editingPostId);
  const setEditingPostId = useSocialModuleUiStore((state) => state.setEditingPostId);
  const editingValue = useSocialModuleUiStore((state) => state.editingValue);
  const setEditingValue = useSocialModuleUiStore((state) => state.setEditingValue);
  const setEditedContentByPost = useSocialModuleInteractionsStore((state) => state.setEditedContentByPost);

  const pendingRemovePost = visibleFeedPosts.find((post) => post.id === pendingRemovePostId) ?? null;

  return {
    pendingRemovePost,
    setPendingRemovePostId,
    setHiddenPosts,
    editingPostId,
    setEditingPostId,
    editingValue,
    setEditingValue,
    setEditedContentByPost,
  };
}

