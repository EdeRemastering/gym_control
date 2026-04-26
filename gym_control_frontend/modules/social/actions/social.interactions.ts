import type { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

export interface LocalCommentItem {
  id: string;
  content: string;
  parentId: string | null;
  persisted: boolean;
}

export async function submitSocialPost(params: {
  userId: string | undefined;
  postContent: string;
  postType?: "publicaciones" | "logros" | "nutricion";
  createPost: (args: {
    userId: string;
    content: string;
    mediaUrl?: string;
    postType?: "PUBLICATION" | "ACHIEVEMENT" | "NUTRITION";
  }) => Promise<unknown>;
  onSuccess: () => void;
}) {
  const { userId, postContent, postType = "publicaciones", createPost, onSuccess } = params;
  if (!userId || !postContent.trim()) return;
  const apiTypeByTab = {
    publicaciones: "PUBLICATION",
    logros: "ACHIEVEMENT",
    nutricion: "NUTRITION",
  } as const;
  await createPost({ userId, content: postContent.trim(), postType: apiTypeByTab[postType] });
  onSuccess();
}

export async function createDemoSocialPost(params: {
  userId: string | undefined;
  demoImageUrl: string;
  createPost: (args: { userId: string; content: string; mediaUrl?: string }) => Promise<unknown>;
}) {
  const { userId, demoImageUrl, createPost } = params;
  if (!userId) return;
  await createPost({
    userId,
    content: "Entrenamiento full body terminado. Mejorando técnica, fuerza y resistencia 💪",
    mediaUrl: demoImageUrl,
  });
}

export async function submitSocialComment(params: {
  postId: string;
  currentUserId: string | undefined;
  commentByPost: Record<string, string>;
  setCommentByPost: Dispatch<SetStateAction<Record<string, string>>>;
  createComment: (args: { postId: string; userId: string; content: string; parentId?: string }) => Promise<unknown>;
}) {
  const { postId, currentUserId, commentByPost, setCommentByPost, createComment } = params;
  if (postId.startsWith("temp-post-")) {
    toast.error("Espera a que la publicación termine de guardarse");
    return;
  }
  const content = commentByPost[postId];
  if (!currentUserId || !content?.trim()) return;
  const trimmedContent = content.trim();
  setCommentByPost((prev) => ({ ...prev, [postId]: "" }));
  try {
    await createComment({
      postId,
      userId: currentUserId,
      content: trimmedContent,
    });
  } catch {
    setCommentByPost((prev) => ({ ...prev, [postId]: trimmedContent }));
    toast.error("No se pudo publicar el comentario");
  }
}

export async function submitSocialReply(params: {
  postId: string;
  parentCommentId: string;
  parentCommentPersisted: boolean;
  currentUserId: string | undefined;
  replyByCommentId: Record<string, string>;
  setReplyByCommentId: Dispatch<SetStateAction<Record<string, string>>>;
  setReplyingToByPost: Dispatch<SetStateAction<Record<string, string | null>>>;
  createComment: (args: { postId: string; userId: string; content: string; parentId?: string }) => Promise<unknown>;
}) {
  const {
    postId,
    parentCommentId,
    parentCommentPersisted,
    currentUserId,
    replyByCommentId,
    setReplyByCommentId,
    setReplyingToByPost,
    createComment,
  } = params;

  if (postId.startsWith("temp-post-")) {
    toast.error("Espera a que la publicación termine de guardarse");
    return;
  }
  if (!parentCommentPersisted) {
    toast.error("Espera unos segundos antes de responder");
    return;
  }
  const content = replyByCommentId[parentCommentId];
  if (!currentUserId || !content?.trim()) return;
  const trimmedContent = content.trim();
  setReplyByCommentId((prev) => ({ ...prev, [parentCommentId]: "" }));
  setReplyingToByPost((prev) => ({ ...prev, [postId]: null }));

  try {
    await createComment({
      postId,
      userId: currentUserId,
      parentId: parentCommentId,
      content: trimmedContent,
    });
  } catch {
    setReplyByCommentId((prev) => ({ ...prev, [parentCommentId]: trimmedContent }));
    toast.error("No se pudo publicar la respuesta");
  }
}

export async function toggleSocialLikeOptimistic(params: {
  postId: string;
  backendIsLiked: boolean;
  backendLikeCount: number;
  currentUserId: string | undefined;
  localLikeState: Record<string, boolean>;
  localLikes: Record<string, number>;
  likeLocks: Record<string, boolean>;
  setLikeLocks: Dispatch<SetStateAction<Record<string, boolean>>>;
  setIsLoadingLike: Dispatch<SetStateAction<Record<string, boolean>>>;
  setLocalLikeState: Dispatch<SetStateAction<Record<string, boolean>>>;
  setLocalLikes: Dispatch<SetStateAction<Record<string, number>>>;
  likePost: (args: { postId: string; userId: string }) => Promise<{ isLiked: boolean; likeCount: number }>;
}) {
  const {
    postId,
    backendIsLiked,
    backendLikeCount,
    currentUserId,
    localLikeState,
    localLikes,
    likeLocks,
    setLikeLocks,
    setIsLoadingLike,
    setLocalLikeState,
    setLocalLikes,
    likePost,
  } = params;

  if (!currentUserId || likeLocks[postId]) return;
  setLikeLocks((prev) => ({ ...prev, [postId]: true }));

  const prevIsLiked = localLikeState[postId] ?? backendIsLiked;
  const prevLikeCount = localLikes[postId] ?? backendLikeCount;
  const nextIsLiked = !prevIsLiked;
  const nextLikeCount = Math.max(0, prevLikeCount + (nextIsLiked ? 1 : -1));

  setIsLoadingLike((prev) => ({ ...prev, [postId]: true }));
  setLocalLikeState((prev) => ({ ...prev, [postId]: nextIsLiked }));
  setLocalLikes((prev) => ({ ...prev, [postId]: nextLikeCount }));

  void likePost({ postId, userId: currentUserId })
    .catch(() => {
      // Rollback solo si el backend falla; la UI no espera confirmación.
      setLocalLikeState((prev) => ({ ...prev, [postId]: prevIsLiked }));
      setLocalLikes((prev) => ({ ...prev, [postId]: prevLikeCount }));
    })
    .finally(() => {
      setIsLoadingLike((prev) => ({ ...prev, [postId]: false }));
      setLikeLocks((prev) => ({ ...prev, [postId]: false }));
    });

}

