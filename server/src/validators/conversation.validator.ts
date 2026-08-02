import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid resource identifier.");

export const conversationIdParamSchema = z.object({ id: objectId }).strict();
export const cursorPaginationSchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
}).strict();
export const markReadSchema = z.object({ conversationId: objectId }).strict();
export const socketJoinRoomSchema = z.object({ conversationId: objectId }).strict();
export const socketSendMessageSchema = z.object({ recipientId: objectId, text: z.string().trim().min(1).max(4000) }).strict();
export const socketTypingSchema = z.object({ conversationId: objectId, isTyping: z.boolean() }).strict();

export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;
