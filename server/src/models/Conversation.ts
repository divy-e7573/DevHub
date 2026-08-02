import { model, Schema, type Types } from "mongoose";
import type { TimestampedEntity } from "../types/database";

export interface IConversation extends TimestampedEntity {
  participants: Types.ObjectId[];
  participantKey: string;
  lastMessage?: Types.ObjectId;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
      required: true,
      validate: {
        validator: (participants: Types.ObjectId[]) => participants.length === 2,
        message: "A direct conversation must have exactly two participants.",
      },
    },
    participantKey: { type: String, required: true, unique: true, select: false },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true },
);

// One canonical direct thread per ordered pair (participants are sorted in the service).
conversationSchema.index({ participants: 1, updatedAt: -1 });

export const Conversation = model<IConversation>("Conversation", conversationSchema);
