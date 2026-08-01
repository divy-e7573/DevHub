import { Post } from "../models/Post";
import { Profile } from "../models/Profile";
import { User } from "../models/User";

export interface SearchUserRecord { _id: { toString(): string }; name: string; username: string }
export interface SearchPostRecord {
  _id: { toString(): string };
  author: { _id: { toString(): string }; name: string; username: string };
  content: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface SearchSkillRecord {
  _id: { toString(): string };
  skills: string[];
  user: { _id: { toString(): string }; name: string; username: string };
}

export function searchUsers(query: string, limit: number): Promise<SearchUserRecord[]> {
  return User.find({ $text: { $search: query } }, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } }).limit(limit).select("name username")
    .lean<SearchUserRecord[]>().exec();
}

export function searchPosts(query: string, limit: number): Promise<SearchPostRecord[]> {
  return Post.find({ $text: { $search: query } }, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" }, createdAt: -1 }).limit(limit)
    .select("author content mediaUrls likesCount commentsCount createdAt updatedAt")
    .populate("author", "name username")
    .lean<SearchPostRecord[]>().exec();
}

export function searchSkills(query: string, limit: number): Promise<SearchSkillRecord[]> {
  return Profile.find({ $text: { $search: query } }, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } }).limit(limit).select("user skills")
    .populate("user", "name username")
    .lean<SearchSkillRecord[]>().exec();
}
