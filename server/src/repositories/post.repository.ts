import { isValidObjectId, type FilterQuery, type HydratedDocument } from "mongoose";
import { Comment, type IComment } from "../models/Comment";
import { Like } from "../models/Like";
import { Post, type IPost } from "../models/Post";

export interface CursorBoundary {
  createdAt: Date;
  id: string;
}

export interface FeedPostRecord extends Omit<IPost, "author"> {
  _id: { toString(): string };
  author: { _id: { toString(): string }; name: string; username: string };
}

export interface CommentRecord extends Omit<IComment, "author" | "post"> {
  _id: { toString(): string };
  author: { _id: { toString(): string }; name: string; username: string };
}

function cursorFilter(cursor?: CursorBoundary): FilterQuery<IPost> {
  if (!cursor) return {};
  return {
    $or: [
      { createdAt: { $lt: cursor.createdAt } },
      { createdAt: cursor.createdAt, _id: { $lt: cursor.id } },
    ],
  };
}

export async function createPostRecord(data: {
  author: string;
  content: string;
  mediaUrls: string[];
}): Promise<HydratedDocument<IPost>> {
  return Post.create(data);
}

export async function findFeedPosts(
  limit: number,
  cursor?: CursorBoundary,
): Promise<FeedPostRecord[]> {
  return Post.find(cursorFilter(cursor))
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .select("author content mediaUrls likesCount commentsCount createdAt updatedAt")
    .populate("author", "name username")
    .lean<FeedPostRecord[]>()
    .exec();
}

export async function findPostForFeed(postId: string): Promise<FeedPostRecord | null> {
  return Post.findById(postId)
    .select("author content mediaUrls likesCount commentsCount createdAt updatedAt")
    .populate("author", "name username")
    .lean<FeedPostRecord>()
    .exec();
}

export function findPostOwner(postId: string): Promise<Pick<IPost, "author"> | null> {
  return Post.findById(postId).select("author").lean<Pick<IPost, "author">>().exec();
}

export function deletePostById(postId: string): Promise<IPost | null> {
  return Post.findByIdAndDelete(postId).exec();
}

export function incrementPostCounter(
  postId: string,
  field: "likesCount" | "commentsCount",
  amount: 1 | -1,
): Promise<IPost | null> {
  return Post.findByIdAndUpdate(
    postId,
    amount === -1 ? { $inc: { [field]: -1 } } : { $inc: { [field]: 1 } },
    { new: true },
  ).exec();
}

export function createLike(postId: string, userId: string): Promise<unknown> {
  return Like.create({ post: postId, user: userId });
}

export function deleteLike(postId: string, userId: string): Promise<unknown> {
  return Like.findOneAndDelete({ post: postId, user: userId }).exec();
}

export async function findLikedPostIds(postIds: string[], userId?: string): Promise<Set<string>> {
  if (!userId || postIds.length === 0) return new Set();
  const likes = await Like.find({ user: userId, post: { $in: postIds } })
    .select("post")
    .lean<{ post: { toString(): string } }[]>()
    .exec();
  return new Set(likes.map((like) => like.post.toString()));
}

export function createCommentRecord(data: {
  post: string;
  author: string;
  content: string;
}): Promise<HydratedDocument<IComment>> {
  return Comment.create(data);
}

export async function findCommentForFeed(commentId: string): Promise<CommentRecord | null> {
  return Comment.findById(commentId)
    .select("author content createdAt updatedAt")
    .populate("author", "name username")
    .lean<CommentRecord>()
    .exec();
}

export async function findPostComments(
  postId: string,
  limit: number,
  cursor?: CursorBoundary,
): Promise<CommentRecord[]> {
  const filter: FilterQuery<IComment> = { post: postId };
  if (cursor) Object.assign(filter, cursorFilter(cursor));
  return Comment.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .select("author content createdAt updatedAt")
    .populate("author", "name username")
    .lean<CommentRecord[]>()
    .exec();
}

export async function deletePostRelations(postId: string): Promise<void> {
  await Promise.all([Comment.deleteMany({ post: postId }), Like.deleteMany({ post: postId })]);
}

export function isPostId(value: string): boolean {
  return isValidObjectId(value);
}
