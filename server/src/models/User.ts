import { model, Schema } from "mongoose";
import type { TimestampedEntity } from "../types/database";

export const USER_ROLES = ["user", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface IUser extends TimestampedEntity {
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  isEmailVerified: boolean;
  avatar?: string;
  lastLoginAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "user",
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Supports exact account lookup and prevents duplicate normalized email addresses.
userSchema.index({ email: 1 }, { unique: true });

// Supports public profile lookup and guarantees one stable normalized handle.
userSchema.index({ username: 1 }, { unique: true });

export const User = model<IUser>("User", userSchema);
