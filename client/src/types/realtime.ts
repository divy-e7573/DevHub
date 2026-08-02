export interface ChatUser { id: string; name: string; username: string; avatar?: string }
export interface ChatMessage { id: string; conversationId: string; sender: ChatUser; text: string; read: boolean; createdAt: string; updatedAt: string }
export interface ConversationSummary { id: string; participant: ChatUser; lastMessage?: { id: string; senderId: string; text: string; createdAt: string; read: boolean }; updatedAt: string }
export type NotificationType = "like" | "comment" | "follow" | "message";
export interface AppNotification { id: string; sender: ChatUser; type: NotificationType; read: boolean; link: string; createdAt: string }
export interface SocketAcknowledgement { ok: boolean; error?: string; data?: { message?: ChatMessage } }
export interface ServerToClientEvents {
  new_message: (message: ChatMessage) => void;
  typing_indicator: (payload: { conversationId: string; userId: string; isTyping: boolean }) => void;
  messages_read: (payload: { conversationId: string; readerId: string }) => void;
  new_notification: (notification: AppNotification) => void;
  presence_update: (payload: { userId: string; isOnline: boolean }) => void;
}
export interface ClientToServerEvents {
  join_room: (payload: { conversationId: string }, acknowledgement?: (response: SocketAcknowledgement) => void) => void;
  send_message: (payload: { recipientId: string; text: string }, acknowledgement?: (response: SocketAcknowledgement) => void) => void;
  typing_indicator: (payload: { conversationId: string; isTyping: boolean }) => void;
  mark_as_read: (payload: { conversationId: string }, acknowledgement?: (response: SocketAcknowledgement) => void) => void;
}
