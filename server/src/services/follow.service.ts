import { isValidObjectId } from "mongoose";
import { findUserById } from "../repositories/user.repository";
import {
  createFollow,
  deleteFollow,
  findFollowers,
  findFollowing,
  getFollowStats,
  type FollowCursorBoundary,
  type FollowUserRecord,
} from "../repositories/follow.repository";
import type { FollowCursorInput } from "../validators/follow.validator";
import { AppError } from "../utils/AppError";

export interface FollowRelationship {
  followingId: string;
  isFollowing: boolean;
  followersCount: number;
}
export interface FollowListUser { id: string; name: string; username: string }
export interface FollowPage { items: FollowListUser[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } }

function encodeCursor(record: FollowUserRecord): string {
  return Buffer.from(JSON.stringify({ id: record._id.toString(), createdAt: record.createdAt.toISOString() })).toString("base64url");
}

function decodeCursor(cursor?: string): FollowCursorBoundary | undefined {
  if (!cursor) return undefined;
  try {
    const value: unknown = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (typeof value !== "object" || value === null || !("id" in value) || !("createdAt" in value) || typeof value.id !== "string" || !isValidObjectId(value.id) || typeof value.createdAt !== "string") throw new Error();
    const createdAt = new Date(value.createdAt);
    if (Number.isNaN(createdAt.getTime())) throw new Error();
    return { id: value.id, createdAt };
  } catch { throw new AppError("The supplied cursor is invalid.", 400, "INVALID_CURSOR"); }
}

async function requireTargetUser(userId: string): Promise<void> {
  if (!await findUserById(userId)) throw new AppError("User not found.", 404, "USER_NOT_FOUND");
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

export async function followUser(followerId: string, followingId: string): Promise<FollowRelationship> {
  if (followerId === followingId) throw new AppError("You cannot follow yourself.", 400, "SELF_FOLLOW_NOT_ALLOWED");
  await requireTargetUser(followingId);
  try { await createFollow(followerId, followingId); } catch (error) { if (!isDuplicateKeyError(error)) throw error; }
  const stats = await getFollowStats(followingId, followerId);
  return { followingId, isFollowing: true, followersCount: stats.followersCount };
}

export async function unfollowUser(followerId: string, followingId: string): Promise<FollowRelationship> {
  await requireTargetUser(followingId);
  await deleteFollow(followerId, followingId);
  const stats = await getFollowStats(followingId, followerId);
  return { followingId, isFollowing: false, followersCount: stats.followersCount };
}

function toPage(records: FollowUserRecord[], limit: number): FollowPage {
  const hasNextPage = records.length > limit;
  const items = (hasNextPage ? records.slice(0, limit) : records).map((record) => ({ id: record.user._id.toString(), name: record.user.name, username: record.user.username }));
  const finalRecord = records[Math.min(records.length, limit) - 1];
  return { items, pageInfo: { hasNextPage, endCursor: finalRecord ? encodeCursor(finalRecord) : null } };
}

export async function getFollowers(userId: string, input: FollowCursorInput): Promise<FollowPage> {
  await requireTargetUser(userId);
  return toPage(await findFollowers(userId, input.limit + 1, decodeCursor(input.cursor)), input.limit);
}

export async function getFollowing(userId: string, input: FollowCursorInput): Promise<FollowPage> {
  await requireTargetUser(userId);
  return toPage(await findFollowing(userId, input.limit + 1, decodeCursor(input.cursor)), input.limit);
}
