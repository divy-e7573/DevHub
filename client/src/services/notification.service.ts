import { api } from "./api";
import type { ApiSuccessResponse } from "@/types/auth";
import type { AppNotification } from "@/types/realtime";
export async function getNotifications(): Promise<{ items: AppNotification[]; unreadCount: number }> { const response = await api.get<ApiSuccessResponse<{ items: AppNotification[]; unreadCount: number }>>("/v1/notifications"); return response.data.data; }
export async function markNotificationsRead(notificationIds: string[]): Promise<void> { await api.patch("/v1/notifications/read", { notificationIds }); }
