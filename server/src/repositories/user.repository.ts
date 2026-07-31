import type { HydratedDocument } from "mongoose";
import { User, type IUser } from "../models/User";

export type CreateUserData = Pick<
  IUser,
  "name" | "username" | "email" | "password"
>;

export async function emailExists(email: string): Promise<boolean> {
  return (await User.exists({ email })) !== null;
}

export async function usernameExists(username: string): Promise<boolean> {
  return (await User.exists({ username })) !== null;
}

export function createUser(
  userData: CreateUserData,
): Promise<HydratedDocument<IUser>> {
  return User.create(userData);
}
