import { model, Schema, type Types } from "mongoose";
import type { TimestampedEntity } from "../types/database";

export interface IComment extends TimestampedEntity {
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
}

const commentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

// Supports cursor pagination for a post's newest-first comments.
commentSchema.index({ post: 1, createdAt: -1, _id: -1 });

export const Comment = model<IComment>("Comment", commentSchema);
