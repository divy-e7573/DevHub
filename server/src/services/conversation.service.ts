import { isValidObjectId } from "mongoose";
import { findUserById } from "../repositories/user.repository";
import { createConversation, createMessage, findConversationByParticipants, findConversationForUser, findMessages, findMessage, findUserConversations, markMessagesRead, setLastMessage, type MessageCursor } from "../repositories/conversation.repository";
import type { CursorPaginationInput } from "../validators/conversation.validator";
import { AppError } from "../utils/AppError";
import { createAndEmitNotification } from "./notification.service";
import { emitConversationMessage, emitReadReceipt } from "../sockets/socket.server";

export interface ChatUser { id: string; name: string; username: string; avatar?: string }
export interface ChatMessage { id: string; conversationId: string; sender: ChatUser; text: string; read: boolean; createdAt: Date; updatedAt: Date }
export interface ConversationSummary { id: string; participant: ChatUser; lastMessage?: { id: string; senderId: string; text: string; createdAt: Date; read: boolean }; updatedAt: Date }

function participantsFor(userId: string, otherUserId: string): string[] { return [userId, otherUserId].sort(); }
function encodeCursor(item: { _id: { toString(): string }; createdAt: Date }): string { return Buffer.from(JSON.stringify({ id: item._id.toString(), createdAt: item.createdAt.toISOString() })).toString("base64url"); }
function decodeCursor(cursor?: string): MessageCursor | undefined { if (!cursor) return undefined; try { const value: unknown = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")); if (typeof value !== "object" || value === null || !("id" in value) || !("createdAt" in value) || typeof value.id !== "string" || !isValidObjectId(value.id) || typeof value.createdAt !== "string") throw new Error(); const createdAt = new Date(value.createdAt); if (Number.isNaN(createdAt.getTime())) throw new Error(); return { id: value.id, createdAt }; } catch { throw new AppError("The supplied cursor is invalid.", 400, "INVALID_CURSOR"); } }
function toMessage(record: NonNullable<Awaited<ReturnType<typeof findMessage>>>): ChatMessage { return { id: record._id.toString(), conversationId: record.conversation.toString(), sender: { id: record.sender._id.toString(), name: record.sender.name, username: record.sender.username, avatar: record.sender.avatar }, text: record.text, read: record.read, createdAt: record.createdAt, updatedAt: record.updatedAt }; }

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  return (await findUserConversations(userId)).map((conversation) => {
    const participant = conversation.participants.find((user) => user._id.toString() !== userId);
    if (!participant) throw new AppError("Conversation has invalid participants.", 500, "INVALID_CONVERSATION");
    return { id: conversation._id.toString(), participant: { id: participant._id.toString(), name: participant.name, username: participant.username, avatar: participant.avatar }, lastMessage: conversation.lastMessage ? { id: conversation.lastMessage._id.toString(), senderId: conversation.lastMessage.sender.toString(), text: conversation.lastMessage.text, createdAt: conversation.lastMessage.createdAt, read: conversation.lastMessage.read } : undefined, updatedAt: conversation.updatedAt };
  });
}

export async function getMessages(userId: string, conversationId: string, input: CursorPaginationInput): Promise<{ items: ChatMessage[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } }> {
  if (!await findConversationForUser(conversationId, userId)) throw new AppError("Conversation not found.", 404, "CONVERSATION_NOT_FOUND");
  const records = await findMessages(conversationId, input.limit + 1, decodeCursor(input.cursor));
  const page = records.length > input.limit ? records.slice(0, input.limit) : records;
  return { items: page.map(toMessage).reverse(), pageInfo: { endCursor: page.length ? encodeCursor(page[page.length - 1]) : null, hasNextPage: records.length > input.limit } };
}

export async function sendMessage(senderId: string, recipientId: string, text: string): Promise<ChatMessage> {
  if (senderId === recipientId) throw new AppError("You cannot message yourself.", 400, "SELF_MESSAGE_NOT_ALLOWED");
  if (!await findUserById(recipientId)) throw new AppError("Recipient not found.", 404, "USER_NOT_FOUND");
  const participants = participantsFor(senderId, recipientId);
  let conversation = await findConversationByParticipants(participants);
  if (!conversation) { try { conversation = await createConversation(participants); } catch (error) { if (!(typeof error === "object" && error !== null && "code" in error && error.code === 11000)) throw error; conversation = await findConversationByParticipants(participants); } }
  if (!conversation) throw new AppError("Conversation could not be created.", 500, "CONVERSATION_CREATION_FAILED");
  const created = await createMessage(conversation._id.toString(), senderId, text);
  await setLastMessage(conversation._id.toString(), created._id.toString());
  const record = await findMessage(created._id.toString());
  if (!record) throw new AppError("Message could not be retrieved.", 500, "MESSAGE_RETRIEVAL_FAILED");
  const message = toMessage(record);
  emitConversationMessage(participants, message);
  void createAndEmitNotification({ recipientId, senderId, type: "message", link: `/messages?conversation=${conversation._id.toString()}` }).catch(() => undefined);
  return message;
}

export async function markConversationRead(userId: string, conversationId: string): Promise<void> {
  const conversation = await findConversationForUser(conversationId, userId);
  if (!conversation) throw new AppError("Conversation not found.", 404, "CONVERSATION_NOT_FOUND");
  await markMessagesRead(conversationId, userId);
  const otherUserId = conversation.participants.find((participant) => participant.toString() !== userId)?.toString();
  if (otherUserId) emitReadReceipt(otherUserId, { conversationId, readerId: userId });
}
