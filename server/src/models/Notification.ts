import { model, Schema, type Types } from "mongoose";
import type { TimestampedEntity } from "../types/database";

export const NOTIFICATION_TYPES = ["like", "comment", "follow", "message"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification extends TimestampedEntity {
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: NotificationType;
  read: boolean;
  link: string;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    read: { type: Boolean, required: true, default: false },
    link: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, createdAt: -1, _id: -1 });
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
