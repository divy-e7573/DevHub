import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { TokenExpiredError, verify, type JwtPayload } from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import { config } from "../config/config";
import { USER_ROLES, type UserRole } from "../models/User";
import { markConversationRead, sendMessage } from "../services/conversation.service";
import { socketJoinRoomSchema, socketSendMessageSchema, socketTypingSchema } from "../validators/conversation.validator";
import type { ChatMessage } from "../services/conversation.service";
import type { NotificationItem } from "../services/notification.service";

interface SocketAuth { userId: string; role: UserRole }
interface Acknowledgement { (response: { ok: boolean; error?: string; data?: { message?: ChatMessage } }): void }
interface ClientToServerEvents {
  join_room: (payload: unknown, acknowledgement?: Acknowledgement) => void;
  send_message: (payload: unknown, acknowledgement?: Acknowledgement) => void;
  typing_indicator: (payload: unknown) => void;
  mark_as_read: (payload: unknown, acknowledgement?: Acknowledgement) => void;
}
interface ServerToClientEvents {
  new_message: (message: ChatMessage) => void;
  typing_indicator: (payload: { conversationId: string; userId: string; isTyping: boolean }) => void;
  messages_read: (payload: { conversationId: string; readerId: string }) => void;
  new_notification: (notification: NotificationItem) => void;
  presence_update: (payload: { userId: string; isOnline: boolean }) => void;
}
type DevHubSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketAuth>;

let io: Server<ClientToServerEvents, ServerToClientEvents> | undefined;
const onlineSocketsByUser = new Map<string, number>();

function userRoom(userId: string): string { return `user:${userId}`; }
function conversationRoom(conversationId: string): string { return `conversation:${conversationId}`; }
function getCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  return cookieHeader.split(";").map((entry) => entry.trim()).find((entry) => entry.startsWith(`${name}=`))?.slice(name.length + 1);
}
function authenticateSocket(socket: DevHubSocket, next: (error?: Error) => void): void {
  const token = getCookie(socket.handshake.headers.cookie, config.auth.cookie.name);
  if (!token) { next(new Error("Authentication is required.")); return; }
  try {
    const decoded = verify(token, config.auth.jwt.secret, { algorithms: ["HS256"] });
    if (typeof decoded === "string" || !isSocketPayload(decoded)) { next(new Error("Invalid authentication token.")); return; }
    socket.data.userId = decoded.sub;
    socket.data.role = decoded.role;
    next();
  } catch (error) { next(new Error(error instanceof TokenExpiredError ? "Authentication token has expired." : "Invalid authentication token.")); }
}
function isSocketPayload(payload: JwtPayload): payload is JwtPayload & { sub: string; role: UserRole } { return typeof payload.sub === "string" && isValidObjectId(payload.sub) && typeof payload.role === "string" && USER_ROLES.includes(payload.role as UserRole); }
function acknowledge(acknowledgement: Acknowledgement | undefined, response: { ok: boolean; error?: string; data?: { message?: ChatMessage } }): void { acknowledgement?.(response); }

export function initializeSocketServer(httpServer: HttpServer): Server<ClientToServerEvents, ServerToClientEvents> {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: config.client.url, credentials: true, methods: ["GET", "POST"] },
    transports: ["websocket", "polling"],
  });
  io.use(authenticateSocket);
  io.on("connection", (socket: DevHubSocket) => {
    const { userId } = socket.data;
    socket.join(userRoom(userId));
    const count = onlineSocketsByUser.get(userId) ?? 0;
    onlineSocketsByUser.set(userId, count + 1);
    for (const onlineUserId of onlineSocketsByUser.keys()) {
      socket.emit("presence_update", { userId: onlineUserId, isOnline: true });
    }
    if (count === 0) io?.emit("presence_update", { userId, isOnline: true });

    socket.on("join_room", async (payload: unknown, acknowledgement?: Acknowledgement) => {
      try {
        const { conversationId } = socketJoinRoomSchema.parse(payload);
        await markConversationRead(userId, conversationId);
        socket.join(conversationRoom(conversationId));
        acknowledge(acknowledgement, { ok: true });
      } catch (error) { acknowledge(acknowledgement, { ok: false, error: error instanceof Error ? error.message : "Unable to join conversation." }); }
    });
    socket.on("send_message", async (payload: unknown, acknowledgement?: Acknowledgement) => {
      try { const input = socketSendMessageSchema.parse(payload); const message = await sendMessage(userId, input.recipientId, input.text); acknowledge(acknowledgement, { ok: true, data: { message } }); }
      catch (error) { acknowledge(acknowledgement, { ok: false, error: error instanceof Error ? error.message : "Unable to send message." }); }
    });
    socket.on("typing_indicator", (payload: unknown) => {
      const result = socketTypingSchema.safeParse(payload);
      if (!result.success) return;
      socket.to(conversationRoom(result.data.conversationId)).emit("typing_indicator", { conversationId: result.data.conversationId, userId, isTyping: result.data.isTyping });
    });
    socket.on("mark_as_read", async (payload: unknown, acknowledgement?: Acknowledgement) => {
      try { const { conversationId } = socketJoinRoomSchema.parse(payload); await markConversationRead(userId, conversationId); acknowledge(acknowledgement, { ok: true }); }
      catch (error) { acknowledge(acknowledgement, { ok: false, error: error instanceof Error ? error.message : "Unable to mark messages as read." }); }
    });
    socket.on("disconnect", () => {
      const remaining = (onlineSocketsByUser.get(userId) ?? 1) - 1;
      if (remaining <= 0) { onlineSocketsByUser.delete(userId); io?.emit("presence_update", { userId, isOnline: false }); }
      else onlineSocketsByUser.set(userId, remaining);
    });
  });
  return io;
}

export function emitConversationMessage(participantIds: string[], message: ChatMessage): void { participantIds.forEach((id) => io?.to(userRoom(id)).emit("new_message", message)); }
export function emitReadReceipt(recipientId: string, payload: { conversationId: string; readerId: string }): void { io?.to(userRoom(recipientId)).emit("messages_read", payload); }
export function emitNotification(recipientId: string, notification: NotificationItem): void { io?.to(userRoom(recipientId)).emit("new_notification", notification); }
