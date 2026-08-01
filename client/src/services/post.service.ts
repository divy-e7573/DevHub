import { api } from "./api";
import type { ApiSuccessResponse } from "@/types/auth";
import type { CursorPage, FeedComment, FeedPost } from "@/types/post";

interface PostResponse { post: FeedPost }
interface CommentResponse { comment: FeedComment }

export async function getFeed(cursor?: string): Promise<CursorPage<FeedPost>> {
  const response = await api.get<ApiSuccessResponse<CursorPage<FeedPost>>>("/v1/posts", { params: { limit: 20, cursor } });
  return response.data.data;
}

export async function createPost(content: string, images: File[]): Promise<FeedPost> {
  const formData = new FormData();
  formData.append("content", content);
  images.forEach((image) => formData.append("images", image));
  const response = await api.post<ApiSuccessResponse<PostResponse>>("/v1/posts", formData, { headers: { "Content-Type": "multipart/form-data" } });
  return response.data.data.post;
}

export async function likePost(postId: string): Promise<FeedPost> {
  const response = await api.post<ApiSuccessResponse<PostResponse>>(`/v1/posts/${postId}/like`);
  return response.data.data.post;
}

export async function unlikePost(postId: string): Promise<FeedPost> {
  const response = await api.delete<ApiSuccessResponse<PostResponse>>(`/v1/posts/${postId}/like`);
  return response.data.data.post;
}

export async function getComments(postId: string): Promise<CursorPage<FeedComment>> {
  const response = await api.get<ApiSuccessResponse<CursorPage<FeedComment>>>(`/v1/posts/${postId}/comments`, { params: { limit: 20 } });
  return response.data.data;
}

export async function createComment(postId: string, content: string): Promise<FeedComment> {
  const response = await api.post<ApiSuccessResponse<CommentResponse>>(`/v1/posts/${postId}/comments`, { content });
  return response.data.data.comment;
}
