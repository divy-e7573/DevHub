import type { FilterQuery, HydratedDocument } from "mongoose";
import { Conversation, type IConversation } from "../models/Conversation";
import { Message, type IMessage } from "../models/Message";

export interface ConversationRecord {
  _id: { toString(): string };
  participants: { _id: { toString(): string }; name: string; username: string; avatar?: string }[];
  lastMessage?: { _id: { toString(): string }; sender: { toString(): string }; text: string; createdAt: Date; read: boolean };
  updatedAt: Date;
}
export interface MessageRecord extends Omit<IMessage, "conversation" | "sender"> {
  _id: { toString(): string };
  conversation: { toString(): string };
  sender: { _id: { toString(): string }; name: string; username: string; avatar?: string };
}
export interface MessageCursor { id: string; createdAt: Date }

export async function findConversationByParticipants(participants: string[]): Promise<HydratedDocument<IConversation> | null> {
  return Conversation.findOne({ participants }).exec();
}
export function createConversation(participants: string[]): Promise<HydratedDocument<IConversation>> { return Conversation.create({ participants, participantKey: participants.join(":" ) }); }
export async function findConversationForUser(conversationId: string, userId: string): Promise<HydratedDocument<IConversation> | null> {
  return Conversation.findOne({ _id: conversationId, participants: userId }).exec();
}
export async function createMessage(conversation: string, sender: string, text: string): Promise<HydratedDocument<IMessage>> {
  return Message.create({ conversation, sender, text });
}
export async function setLastMessage(conversationId: string, messageId: string): Promise<void> {
  await Conversation.findByIdAndUpdate(conversationId, { lastMessage: messageId, updatedAt: new Date() }).exec();
}
export async function findMessage(messageId: string): Promise<MessageRecord | null> {
  return Message.findById(messageId).populate("sender", "name username avatar").lean<MessageRecord>().exec();
}
export async function findUserConversations(userId: string): Promise<ConversationRecord[]> {
  return Conversation.find({ participants: userId }).sort({ updatedAt: -1, _id: -1 }).populate("participants", "name username avatar").populate("lastMessage", "sender text createdAt read").lean<ConversationRecord[]>().exec();
}
export async function findMessages(conversation: string, limit: number, cursor?: MessageCursor): Promise<MessageRecord[]> {
  const filter: FilterQuery<IMessage> = { conversation };
  if (cursor) filter.$or = [{ createdAt: { $lt: cursor.createdAt } }, { createdAt: cursor.createdAt, _id: { $lt: cursor.id } }];
  return Message.find(filter).sort({ createdAt: -1, _id: -1 }).limit(limit).populate("sender", "name username avatar").lean<MessageRecord[]>().exec();
}
export async function markMessagesRead(conversation: string, recipient: string): Promise<void> {
  await Message.updateMany({ conversation, sender: { $ne: recipient }, read: false }, { read: true }).exec();
}
