import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import type { HydratedDocument } from "mongoose";
import { config } from "../config/config";
import type { IUser } from "../models/User";
import {
  createUser,
  emailExists,
  findUserByEmailWithPassword,
  findUserById,
  usernameExists,
} from "../repositories/user.repository";
import type {
  LoginUserInput,
  RegisterUserInput,
} from "../validators/auth.validator";
import { AppError } from "../utils/AppError";

export interface AuthenticatedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: IUser["role"];
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toAuthenticatedUser(user: HydratedDocument<IUser>): AuthenticatedUser {
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
): Promise<AuthenticatedUser> {
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

  const password = await hash(input.password, config.auth.password.saltRounds);
  const user = await createUser({
    name: input.name,
    username: input.username,
    email: input.email,
    password,
  });

  return toAuthenticatedUser(user);
}

export interface LoginResult {
  token: string;
  user: AuthenticatedUser;
}

export async function loginUser(input: LoginUserInput): Promise<LoginResult> {
  const user = await findUserByEmailWithPassword(input.email);

  if (!user || !(await compare(input.password, user.password))) {
    throw new AppError(
      "Invalid email or password.",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const token = sign({ role: user.role }, config.auth.jwt.secret, {
    algorithm: "HS256",
    subject: user._id.toString(),
    expiresIn: config.auth.jwt.expiresIn,
  });

  return {
    token,
    user: toAuthenticatedUser(user),
  };
}

export async function getCurrentUser(
  userId: string,
): Promise<AuthenticatedUser> {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("Authenticated user was not found.", 401, "INVALID_TOKEN");
  }

  return toAuthenticatedUser(user);
}
