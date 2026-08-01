import type { HydratedDocument } from "mongoose";
import { Profile, type IProfile } from "../models/Profile";

export function findProfileByUserId(
  userId: string,
): Promise<HydratedDocument<IProfile> | null> {
  return Profile.findOne({ user: userId }).exec();
}

export function updateProfileByUserId(
  userId: string,
  changes: Partial<Omit<IProfile, "user" | "createdAt" | "updatedAt">>,
): Promise<HydratedDocument<IProfile>> {
  return Profile.findOneAndUpdate(
    { user: userId },
    { $set: changes, $setOnInsert: { user: userId } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).exec() as Promise<HydratedDocument<IProfile>>;
}
