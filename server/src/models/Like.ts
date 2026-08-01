import { model, Schema, type Types } from "mongoose";
import type { TimestampedEntity } from "../types/database";

export interface ILike extends TimestampedEntity {
  post: Types.ObjectId;
  user: Types.ObjectId;
}

const likeSchema = new Schema<ILike>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

// Source-of-truth constraint: a user can like a post only once.
likeSchema.index({ post: 1, user: 1 }, { unique: true });
// Supports future users-who-liked-this-post pagination.
likeSchema.index({ post: 1, createdAt: -1, _id: -1 });

export const Like = model<ILike>("Like", likeSchema);
