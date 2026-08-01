import type { FilterQuery, HydratedDocument } from "mongoose";
import { Follow, type IFollow } from "../models/Follow";

export interface FollowCursorBoundary { createdAt: Date; id: string }
export interface FollowUserRecord {
  _id: { toString(): string };
  createdAt: Date;
  user: { _id: { toString(): string }; name: string; username: string };
}
interface PopulatedFollowRecord {
  _id: { toString(): string };
  createdAt: Date;
  follower?: { _id: { toString(): string }; name: string; username: string };
  following?: { _id: { toString(): string }; name: string; username: string };
}

function cursorFilter(cursor?: FollowCursorBoundary): FilterQuery<IFollow> {
  if (!cursor) return {};
  return { $or: [{ createdAt: { $lt: cursor.createdAt } }, { createdAt: cursor.createdAt, _id: { $lt: cursor.id } }] };
}

export function createFollow(follower: string, following: string): Promise<HydratedDocument<IFollow>> {
  return Follow.create({ follower, following });
}

export function deleteFollow(follower: string, following: string): Promise<IFollow | null> {
  return Follow.findOneAndDelete({ follower, following }).exec();
}

export async function getFollowStats(userId: string, viewerId?: string): Promise<{ followersCount: number; followingCount: number; isFollowing: boolean }> {
  const [followersCount, followingCount, relationship] = await Promise.all([
    Follow.countDocuments({ following: userId }),
    Follow.countDocuments({ follower: userId }),
    viewerId ? Follow.exists({ follower: viewerId, following: userId }) : null,
  ]);
  return { followersCount, followingCount, isFollowing: relationship !== null };
}

export async function findFollowedUserIds(userIds: string[], followerId?: string): Promise<Set<string>> {
  if (!followerId || userIds.length === 0) return new Set();
  const records = await Follow.find({ follower: followerId, following: { $in: userIds } })
    .select("following").lean<{ following: { toString(): string } }[]>().exec();
  return new Set(records.map((record) => record.following.toString()));
}

export async function findFollowers(userId: string, limit: number, cursor?: FollowCursorBoundary): Promise<FollowUserRecord[]> {
  return Follow.find({ following: userId, ...cursorFilter(cursor) })
    .sort({ createdAt: -1, _id: -1 }).limit(limit).select("follower createdAt")
    .populate("follower", "name username")
    .lean<PopulatedFollowRecord[]>().exec().then((records) => records.map((record) => ({ _id: record._id, createdAt: record.createdAt, user: record.follower! })));
}

export async function findFollowing(userId: string, limit: number, cursor?: FollowCursorBoundary): Promise<FollowUserRecord[]> {
  return Follow.find({ follower: userId, ...cursorFilter(cursor) })
    .sort({ createdAt: -1, _id: -1 }).limit(limit).select("following createdAt")
    .populate("following", "name username")
    .lean<PopulatedFollowRecord[]>().exec().then((records) => records.map((record) => ({ _id: record._id, createdAt: record.createdAt, user: record.following! })));
}
