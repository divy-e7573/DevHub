import type { HydratedDocument } from "mongoose";
import { Notification, type INotification } from "../models/Notification";

export interface NotificationRecord extends Omit<INotification, "recipient" | "sender"> {
  _id: { toString(): string };
  sender: { _id: { toString(): string }; name: string; username: string; avatar?: string };
}
export function createNotification(data: { recipient: string; sender: string; type: INotification["type"]; link: string }): Promise<HydratedDocument<INotification>> { return Notification.create(data); }
export async function findNotifications(recipient: string, limit: number): Promise<NotificationRecord[]> { return Notification.find({ recipient }).sort({ createdAt: -1, _id: -1 }).limit(limit).populate("sender", "name username avatar").lean<NotificationRecord[]>().exec(); }
export async function markNotificationsRead(recipient: string, notificationIds: string[]): Promise<number> { const result = await Notification.updateMany({ _id: { $in: notificationIds }, recipient }, { read: true }).exec(); return result.modifiedCount; }
