"use client";

import { useMemo } from "react";
import { useSessionStore } from "@/lib/session-store";
import { normalizeSocialText } from "@/modules/social/actions/social.actions";
import {
  submitSocialComment,
  submitSocialPost,
  submitSocialReply,
  toggleSocialLikeOptimistic,
} from "@/modules/social/actions/social.interactions";
import { useSocial } from "@/modules/social/hooks/use-social";
import { useSocialModuleInteractionsStore } from "@/modules/social/store/use-social-module-interactions-store";
import { useSocialModuleUiStore } from "@/modules/social/store/use-social-module-ui-store";
import { selectStoryUserIds, selectVisibleFeedPosts, sortPostsByDateDesc } from "@/modules/social/selectors/social.selectors";

export function useSocialFeedController() {
  const socialModule = useSocial();
  const currentUser = socialModule.currentUser;
  const currentGymId = useSessionStore((state) => state.user?.gymId);
  const posts = socialModule.postsQuery;
  const explorePosts = socialModule.explorePostsQuery;
  const gyms = socialModule.gyms;
  const createPost = socialModule.createPost;
  const createComment = socialModule.createComment;
  const likePost = socialModule.likePost;
  const pendingPostIds = socialModule.pendingPostIds;

  const commentByPost = useSocialModuleInteractionsStore((state) => state.commentByPost);
  const setCommentByPost = useSocialModuleInteractionsStore((state) => state.setCommentByPost);
  const localLikes = useSocialModuleInteractionsStore((state) => state.localLikes);
  const setLocalLikes = useSocialModuleInteractionsStore((state) => state.setLocalLikes);
  const localLikeState = useSocialModuleInteractionsStore((state) => state.localLikeState);
  const setLocalLikeState = useSocialModuleInteractionsStore((state) => state.setLocalLikeState);
  const isLoadingLike = useSocialModuleInteractionsStore((state) => state.isLoadingLike);
  const setIsLoadingLike = useSocialModuleInteractionsStore((state) => state.setIsLoadingLike);
  const likeLocks = useSocialModuleInteractionsStore((state) => state.likeLocks);
  const setLikeLocks = useSocialModuleInteractionsStore((state) => state.setLikeLocks);
  const localComments = useSocialModuleInteractionsStore((state) => state.localComments);
  const replyByCommentId = useSocialModuleInteractionsStore((state) => state.replyByCommentId);
  const setReplyByCommentId = useSocialModuleInteractionsStore((state) => state.setReplyByCommentId);
  const replyingToByPost = useSocialModuleInteractionsStore((state) => state.replyingToByPost);
  const setReplyingToByPost = useSocialModuleInteractionsStore((state) => state.setReplyingToByPost);
  const commentsOpenByPost = useSocialModuleInteractionsStore((state) => state.commentsOpenByPost);
  const setCommentsOpenByPost = useSocialModuleInteractionsStore((state) => state.setCommentsOpenByPost);
  const editedContentByPost = useSocialModuleInteractionsStore((state) => state.editedContentByPost);

  const socialView = useSocialModuleUiStore((state) => state.socialView);
  const setSocialView = useSocialModuleUiStore((state) => state.setSocialView);
  const visiblePosts = useSocialModuleUiStore((state) => state.visiblePosts);
  const setVisiblePosts = useSocialModuleUiStore((state) => state.setVisiblePosts);
  const hiddenPosts = useSocialModuleUiStore((state) => state.hiddenPosts);
  const setPendingRemovePostId = useSocialModuleUiStore((state) => state.setPendingRemovePostId);
  const setEditingPostId = useSocialModuleUiStore((state) => state.setEditingPostId);
  const setEditingValue = useSocialModuleUiStore((state) => state.setEditingValue);
  const profileBio = useSocialModuleUiStore((state) => state.profileBio);
  const setProfileBio = useSocialModuleUiStore((state) => state.setProfileBio);
  const isBioExpanded = useSocialModuleUiStore((state) => state.isBioExpanded);
  const setIsBioExpanded = useSocialModuleUiStore((state) => state.setIsBioExpanded);
  const socialTab = useSocialModuleUiStore((state) => state.socialTab);
  const setSocialTab = useSocialModuleUiStore((state) => state.setSocialTab);
  const composerPostType = useSocialModuleUiStore((state) => state.composerPostType);
  const setComposerPostType = useSocialModuleUiStore((state) => state.setComposerPostType);

  const activePostsQuery = socialView === "feed" ? posts : explorePosts;
  const sortedPosts = useMemo(() => sortPostsByDateDesc(activePostsQuery.data ?? []), [activePostsQuery.data]);
  const visibleFeedPosts = useMemo(() => selectVisibleFeedPosts(sortedPosts, hiddenPosts), [sortedPosts, hiddenPosts]);

  const storyUserIds = useMemo(() => selectStoryUserIds(visibleFeedPosts, currentUser?.id), [visibleFeedPosts, currentUser?.id]);
  const currentGymName = useMemo(
    () => gyms.data?.find((gym) => gym.id === currentGymId)?.name ?? "Tu gimnasio",
    [gyms.data, currentGymId],
  );
  const bannerMemberCount = socialView === "feed" ? Math.max(storyUserIds.length, 1) : gyms.data?.length ?? 0;
  const bannerOnlineCount =
    socialView === "feed"
      ? Math.max(1, Math.round(bannerMemberCount * 0.35))
      : Math.max(1, Math.round((gyms.data?.length ?? 1) * 1.5));
  async function submitPost(content: string) {
    await submitSocialPost({
      userId: currentUser?.id,
      postContent: content,
      postType: composerPostType,
      createPost: (args) => createPost.mutateAsync(args),
      onSuccess: () => undefined,
    });
  }

  async function submitComment(postId: string) {
    await submitSocialComment({
      postId,
      currentUserId: currentUser?.id,
      commentByPost,
      setCommentByPost,
      createComment: (args) => createComment.mutateAsync(args),
    });
  }

  async function submitReply(postId: string, parentCommentId: string, parentCommentPersisted: boolean) {
    await submitSocialReply({
      postId,
      parentCommentId,
      parentCommentPersisted,
      currentUserId: currentUser?.id,
      replyByCommentId,
      setReplyByCommentId,
      setReplyingToByPost,
      createComment: (args) => createComment.mutateAsync(args),
    });
  }

  async function toggleLike(postId: string, backendIsLiked: boolean, backendLikeCount: number) {
    await toggleSocialLikeOptimistic({
      postId,
      backendIsLiked,
      backendLikeCount,
      currentUserId: currentUser?.id,
      localLikeState,
      localLikes,
      likeLocks,
      setLikeLocks,
      setIsLoadingLike,
      setLocalLikeState,
      setLocalLikes,
      likePost: (args) => likePost.mutateAsync(args),
    });
  }

  function openEditor(postId: string, currentContent: string) {
    setEditingPostId(postId);
    setEditingValue(currentContent);
  }

  function focusComposerInput() {
    const input = document.querySelector<HTMLInputElement>('input[placeholder^="Comparte"]');
    input?.focus();
  }

  const tabbedFeedPosts = useMemo(() => {
    if (socialTab === "publicaciones") return visibleFeedPosts;
    const getPostType = (postType: string | undefined, content: string) => {
      if (postType === "ACHIEVEMENT") return "logros";
      if (postType === "NUTRITION") return "nutricion";
      if (postType === "PUBLICATION") return "publicaciones";
      const normalized = content.toLowerCase();
      if (normalized.includes("#nutricion")) return "nutricion";
      if (normalized.includes("#logro")) return "logros";
      if (normalized.includes("#publicacion")) return "publicaciones";
      return "publicaciones";
    };
    return visibleFeedPosts.filter((post) => {
      const content = normalizeSocialText(editedContentByPost[post.id] ?? post.content);
      return getPostType(post.postType, content) === socialTab;
    });
  }, [socialTab, visibleFeedPosts, editedContentByPost]);

  return {
    currentUser,
    socialView,
    setSocialView,
    profileBio,
    isBioExpanded,
    setIsBioExpanded,
    setProfileBio,
    onFocusComposer: focusComposerInput,
    submitPost,
    composerPostType,
    setComposerPostType,
    isCreatePending: createPost.isPending,
    socialTab,
    setSocialTab,
    activePostsQuery: { isPending: activePostsQuery.isPending, isError: activePostsQuery.isError },
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
    visibleFeedPosts,
    bannerMemberCount,
    bannerOnlineCount,
    currentGymName,
  };
}

