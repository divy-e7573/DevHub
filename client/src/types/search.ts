import type { FeedPost } from "./post";

export type SearchType = "users" | "posts" | "skills";
export interface SearchIdentity { id: string; name: string; username: string }
export interface SearchUser extends SearchIdentity { isFollowing: boolean }
export interface SearchSkill { user: SearchIdentity; skills: string[] }
export type SearchResponse =
  | { type: "users"; results: SearchUser[] }
  | { type: "posts"; results: FeedPost[] }
  | { type: "skills"; results: SearchSkill[] };
