import type { HydratedDocument } from "mongoose";
import { type IProfile } from "../models/Profile";
import { findUserById, findUserByUsername } from "../repositories/user.repository";
import {
  findProfileByUserId,
  updateProfileByUserId,
} from "../repositories/profile.repository";
import { getFollowStats } from "../repositories/follow.repository";
import type { UpdateProfileInput } from "../validators/profile.validator";
import { AppError } from "../utils/AppError";

export interface PublicProfile {
  user: {
    id: string;
    name: string;
    username: string;
  };
  bio?: string;
  location?: string;
  skills: string[];
  experience: IProfile["experience"];
  education: IProfile["education"];
  portfolio: IProfile["portfolio"];
  socialLinks: IProfile["socialLinks"];
  avatarUrl?: string;
  coverImageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

function toPublicProfile(
  user: { _id: { toString(): string }; name: string; username: string },
  profile: HydratedDocument<IProfile> | null,
  followStats: { followersCount: number; followingCount: number; isFollowing: boolean },
): PublicProfile {
  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
    },
    bio: profile?.bio,
    location: profile?.location,
    skills: profile?.skills ?? [],
    experience: profile?.experience ?? [],
    education: profile?.education ?? [],
    portfolio: profile?.portfolio ?? [],
    socialLinks: profile?.socialLinks ?? {},
    avatarUrl: profile?.avatarUrl,
    coverImageUrl: profile?.coverImageUrl,
    createdAt: profile?.createdAt,
    updatedAt: profile?.updatedAt,
    ...followStats,
  };
}

export async function getPublicProfile(username: string, viewerId?: string): Promise<PublicProfile> {
  const user = await findUserByUsername(username);

  if (!user) {
    throw new AppError("Profile not found.", 404, "PROFILE_NOT_FOUND");
  }

  const profile = await findProfileByUserId(user._id.toString());
  return toPublicProfile(user, profile, await getFollowStats(user._id.toString(), viewerId));
}

export async function updateCurrentProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<PublicProfile> {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("Authenticated user was not found.", 401, "INVALID_TOKEN");
  }

  const profile = await updateProfileByUserId(userId, input);
  return toPublicProfile(user, profile, await getFollowStats(userId, userId));
}

export async function updateProfileImage(
  userId: string,
  field: "avatarUrl" | "coverImageUrl",
  imageUrl: string,
): Promise<PublicProfile> {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("Authenticated user was not found.", 401, "INVALID_TOKEN");
  }

  const profile = await updateProfileByUserId(userId, { [field]: imageUrl });
  return toPublicProfile(user, profile, await getFollowStats(userId, userId));
}
