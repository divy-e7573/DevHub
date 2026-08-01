import { model, Schema, type Types } from "mongoose";
import type { TimestampedEntity } from "../types/database";

export interface IFollow extends TimestampedEntity {
  follower: Types.ObjectId;
  following: Types.ObjectId;
}

const followSchema = new Schema<IFollow>(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

// Enforces one directed relationship and prevents duplicate follows.
followSchema.index({ follower: 1, following: 1 }, { unique: true });
// Supports newest-first follower lists.
followSchema.index({ following: 1, createdAt: -1, _id: -1 });
// Supports newest-first following lists.
followSchema.index({ follower: 1, createdAt: -1, _id: -1 });

export const Follow = model<IFollow>("Follow", followSchema);
