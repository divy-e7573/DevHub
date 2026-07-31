import { hash } from "bcrypt";
import type { HydratedDocument } from "mongoose";
import type { IUser } from "../models/User";
import {
  createUser,
  emailExists,
  usernameExists,
} from "../repositories/user.repository";
import type { RegisterUserInput } from "../validators/auth.validator";
import { AppError } from "../utils/AppError";

const BCRYPT_SALT_ROUNDS = 12;

export interface RegisteredUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: IUser["role"];
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toRegisteredUser(user: HydratedDocument<IUser>): RegisteredUser {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function registerUser(
  input: RegisterUserInput,
): Promise<RegisteredUser> {
  if (await emailExists(input.email)) {
    throw new AppError(
      "An account with this email already exists.",
      409,
      "EMAIL_ALREADY_EXISTS",
      { field: "email" },
    );
  }

  if (await usernameExists(input.username)) {
    throw new AppError(
      "This username is already taken.",
      409,
      "USERNAME_ALREADY_EXISTS",
      { field: "username" },
    );
  }

  const password = await hash(input.password, BCRYPT_SALT_ROUNDS);
  const user = await createUser({
    name: input.name,
    username: input.username,
    email: input.email,
    password,
  });

  return toRegisteredUser(user);
}
