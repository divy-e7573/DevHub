import { model, Schema, type Types } from "mongoose";
import type { TimestampedEntity } from "../types/database";

export interface IMessage extends TimestampedEntity {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  read: boolean;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 4000 },
    read: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

messageSchema.index({ conversation: 1, createdAt: -1, _id: -1 });
messageSchema.index({ conversation: 1, sender: 1, read: 1 });

export const Message = model<IMessage>("Message", messageSchema);
