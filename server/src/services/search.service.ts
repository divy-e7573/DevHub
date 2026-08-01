import { findLikedPostIds } from "../repositories/post.repository";
import { findFollowedUserIds } from "../repositories/follow.repository";
import { searchPosts, searchSkills, searchUsers } from "../repositories/search.repository";
import type { SearchQueryInput } from "../validators/search.validator";

export interface SearchIdentity { id: string; name: string; username: string }
export interface SearchUserResult extends SearchIdentity { isFollowing: boolean }
export interface SearchPostResult {
  id: string;
  author: SearchIdentity;
  content: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface SearchSkillResult { user: SearchIdentity; skills: string[] }
export type SearchResponse =
  | { type: "users"; results: SearchUserResult[] }
  | { type: "posts"; results: SearchPostResult[] }
  | { type: "skills"; results: SearchSkillResult[] };

export async function search(input: SearchQueryInput, viewerId?: string): Promise<SearchResponse> {
  if (input.type === "users") {
    const records = await searchUsers(input.q, input.limit);
    const followedUserIds = await findFollowedUserIds(records.map((record) => record._id.toString()), viewerId);
    return { type: "users", results: records.map((record) => ({ id: record._id.toString(), name: record.name, username: record.username, isFollowing: followedUserIds.has(record._id.toString()) })) };
  }
  if (input.type === "skills") {
    const records = await searchSkills(input.q, input.limit);
    return { type: "skills", results: records.map((record) => ({ user: { id: record.user._id.toString(), name: record.user.name, username: record.user.username }, skills: record.skills })) };
  }
  const records = await searchPosts(input.q, input.limit);
  const likedPostIds = await findLikedPostIds(records.map((record) => record._id.toString()), viewerId);
  const results: SearchPostResult[] = records.map((record) => ({ id: record._id.toString(), author: { id: record.author._id.toString(), name: record.author.name, username: record.author.username }, content: record.content, mediaUrls: record.mediaUrls, likesCount: record.likesCount, commentsCount: record.commentsCount, isLiked: likedPostIds.has(record._id.toString()), createdAt: record.createdAt, updatedAt: record.updatedAt }));
  return { type: "posts", results };
}
