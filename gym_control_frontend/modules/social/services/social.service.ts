import { api } from "@/lib/api/services";

export const socialService = {
  listPosts: api.socialPosts,
  createPost: api.createSocialPost,
  createComment: api.createSocialComment,
  likePost: api.likePost,
};
