import { model, Schema, type Types } from "mongoose";
import type { TimestampedEntity } from "../types/database";

export interface IPost extends TimestampedEntity {
  author: Types.ObjectId;
  content: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
}

const postSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Image-only posts are allowed; the service requires content or media.
    content: { type: String, default: "", trim: true, maxlength: 5000 },
    mediaUrls: { type: [String], default: [], maxlength: 4 },
    likesCount: { type: Number, default: 0, min: 0, required: true },
    commentsCount: { type: Number, default: 0, min: 0, required: true },
  },
  { timestamps: true },
);

// Supports the newest-first public feed cursor query.
postSchema.index({ createdAt: -1, _id: -1 });
// Supports a user's newest-first posts on their profile.
postSchema.index({ author: 1, createdAt: -1, _id: -1 });
// Supports bounded full-text post search.
postSchema.index({ content: "text" });

export const Post = model<IPost>("Post", postSchema);
