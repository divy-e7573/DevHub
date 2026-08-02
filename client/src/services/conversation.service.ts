import { api } from "./api";
import type { ApiSuccessResponse } from "@/types/auth";
import type { ChatMessage, ConversationSummary } from "@/types/realtime";
export async function getConversations(): Promise<ConversationSummary[]> { const response = await api.get<ApiSuccessResponse<{ conversations: ConversationSummary[] }>>("/v1/conversations"); return response.data.data.conversations; }
export async function getMessages(conversationId: string, cursor?: string): Promise<{ items: ChatMessage[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } }> { const response = await api.get<ApiSuccessResponse<{ items: ChatMessage[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } }>>(`/v1/conversations/${conversationId}/messages`, { params: cursor ? { cursor } : undefined }); return response.data.data; }
