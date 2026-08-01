import { isValidObjectId } from "mongoose";
import {
  createCommentRecord,
  createLike,
  createPostRecord,
  deleteLike,
  deletePostById,
  deletePostRelations,
  findFeedPosts,
  findCommentForFeed,
  findLikedPostIds,
  findPostComments,
  findPostForFeed,
  findPostOwner,
  incrementPostCounter,
  type CommentRecord,
  type CursorBoundary,
  type FeedPostRecord,
} from "../repositories/post.repository";
import type { CreateCommentInput, CreatePostInput, CursorPaginationInput } from "../validators/post.validator";
import { AppError } from "../utils/AppError";

export interface PostAuthor {
  id: string;
  name: string;
  username: string;
}

export interface FeedPost {
  id: string;
  author: PostAuthor;
  content: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedComment {
  id: string;
  author: PostAuthor;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CursorPage<T> {
  items: T[];
  pageInfo: { endCursor: string | null; hasNextPage: boolean };
}

function encodeCursor(item: { _id: { toString(): string }; createdAt: Date }): string {
  return Buffer.from(JSON.stringify({ id: item._id.toString(), createdAt: item.createdAt.toISOString() })).toString("base64url");
}

function decodeCursor(cursor?: string): CursorBoundary | undefined {
  if (!cursor) return undefined;
  try {
    const value: unknown = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (
      typeof value !== "object" ||
      value === null ||
      !("id" in value) ||
      !("createdAt" in value) ||
      typeof value.id !== "string" ||
      !isValidObjectId(value.id) ||
      typeof value.createdAt !== "string"
    ) throw new Error("Invalid cursor");
    const createdAt = new Date(value.createdAt);
    if (Number.isNaN(createdAt.getTime())) throw new Error("Invalid cursor");
    return { id: value.id, createdAt };
  } catch {
    throw new AppError("The supplied cursor is invalid.", 400, "INVALID_CURSOR");
  }
}

function toPost(record: FeedPostRecord, likedPostIds: Set<string>): FeedPost {
  return {
    id: record._id.toString(),
    author: { id: record.author._id.toString(), name: record.author.name, username: record.author.username },
    content: record.content,
    mediaUrls: record.mediaUrls,
    likesCount: record.likesCount,
    commentsCount: record.commentsCount,
    isLiked: likedPostIds.has(record._id.toString()),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toComment(record: CommentRecord): FeedComment {
  return {
    id: record._id.toString(),
    author: { id: record.author._id.toString(), name: record.author.name, username: record.author.username },
    content: record.content,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

async function findExistingPost(postId: string): Promise<FeedPostRecord> {
  const post = await findPostForFeed(postId);
  if (!post) throw new AppError("Post not found.", 404, "POST_NOT_FOUND");
  return post;
}

export async function createPost(
  userId: string,
  input: CreatePostInput,
  mediaUrls: string[],
): Promise<FeedPost> {
  if (!input.content && mediaUrls.length === 0) {
    throw new AppError("Post content or an image is required.", 400, "POST_CONTENT_REQUIRED");
  }
  const post = await createPostRecord({ author: userId, content: input.content, mediaUrls });
  return toPost(await findExistingPost(post._id.toString()), new Set());
}

export async function getFeed(
  input: CursorPaginationInput,
  viewerId?: string,
): Promise<CursorPage<FeedPost>> {
  const records = await findFeedPosts(input.limit + 1, decodeCursor(input.cursor));
  const hasNextPage = records.length > input.limit;
  const pageRecords = hasNextPage ? records.slice(0, input.limit) : records;
  const likedPostIds = await findLikedPostIds(pageRecords.map((post) => post._id.toString()), viewerId);
  return {
    items: pageRecords.map((record) => toPost(record, likedPostIds)),
    pageInfo: { endCursor: pageRecords.length ? encodeCursor(pageRecords[pageRecords.length - 1]) : null, hasNextPage },
  };
}

export async function deletePost(postId: string, userId: string): Promise<void> {
  const post = await findPostOwner(postId);
  if (!post) throw new AppError("Post not found.", 404, "POST_NOT_FOUND");
  if (post.author.toString() !== userId) throw new AppError("You may only delete your own posts.", 403, "POST_FORBIDDEN");
  await deletePostById(postId);
  await deletePostRelations(postId);
}

export async function likePost(postId: string, userId: string): Promise<FeedPost> {
  await findExistingPost(postId);
  let created = false;
  try { await createLike(postId, userId); created = true; } catch (error) {
    if (!(typeof error === "object" && error !== null && "code" in error && error.code === 11000)) throw error;
  }
  if (created) await incrementPostCounter(postId, "likesCount", 1);
  return toPost(await findExistingPost(postId), new Set([postId]));
}

export async function unlikePost(postId: string, userId: string): Promise<FeedPost> {
  await findExistingPost(postId);
  const deleted = await deleteLike(postId, userId);
  if (deleted) await incrementPostCounter(postId, "likesCount", -1);
  return toPost(await findExistingPost(postId), new Set());
}

export async function addComment(postId: string, userId: string, input: CreateCommentInput): Promise<FeedComment> {
  await findExistingPost(postId);
  const comment = await createCommentRecord({ post: postId, author: userId, content: input.content });
  await incrementPostCounter(postId, "commentsCount", 1);
  const populatedComment = await findCommentForFeed(comment._id.toString());
  if (!populatedComment) throw new AppError("Comment could not be retrieved.", 500, "COMMENT_RETRIEVAL_FAILED");
  return toComment(populatedComment);
}

export async function getComments(postId: string, input: CursorPaginationInput): Promise<CursorPage<FeedComment>> {
  await findExistingPost(postId);
  const records = await findPostComments(postId, input.limit + 1, decodeCursor(input.cursor));
  const hasNextPage = records.length > input.limit;
  const pageRecords = hasNextPage ? records.slice(0, input.limit) : records;
  return { items: pageRecords.map(toComment), pageInfo: { endCursor: pageRecords.length ? encodeCursor(pageRecords[pageRecords.length - 1]) : null, hasNextPage } };
}
