import { findUserById } from "../repositories/user.repository";
import { createNotification, findNotifications, markNotificationsRead } from "../repositories/notification.repository";
import type { NotificationType } from "../models/Notification";
import { emitNotification } from "../sockets/socket.server";
import { AppError } from "../utils/AppError";

export interface NotificationItem {
  id: string;
  sender: { id: string; name: string; username: string; avatar?: string };
  type: NotificationType;
  read: boolean;
  link: string;
  createdAt: Date;
}

function toNotification(record: Awaited<ReturnType<typeof findNotifications>>[number]): NotificationItem {
  return { id: record._id.toString(), sender: { id: record.sender._id.toString(), name: record.sender.name, username: record.sender.username, avatar: record.sender.avatar }, type: record.type, read: record.read, link: record.link, createdAt: record.createdAt };
}

/** Creates a durable notification and attempts a live delivery to the recipient's personal room. */
export async function createAndEmitNotification(input: { recipientId: string; senderId: string; type: NotificationType; link: string }): Promise<void> {
  if (input.recipientId === input.senderId) return;
  const notification = await createNotification({ recipient: input.recipientId, sender: input.senderId, type: input.type, link: input.link });
  const records = await findNotifications(input.recipientId, 1);
  const latest = records.find((record) => record._id.toString() === notification._id.toString());
  if (latest) emitNotification(input.recipientId, toNotification(latest));
}

export async function getNotifications(userId: string): Promise<{ items: NotificationItem[]; unreadCount: number }> {
  const items = (await findNotifications(userId, 50)).map(toNotification);
  return { items, unreadCount: items.filter((item) => !item.read).length };
}

export async function markRead(userId: string, notificationIds: string[]): Promise<number> {
  if (!await findUserById(userId)) throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  return markNotificationsRead(userId, notificationIds);
}
