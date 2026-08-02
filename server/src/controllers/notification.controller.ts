import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { successResponse } from "../utils/response";
import { getNotifications, markRead } from "../services/notification.service";
import { markNotificationsReadSchema } from "../validators/notification.validator";
function requireUserId(req: Request): string { if (!req.user) throw new AppError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED"); return req.user.id; }
export async function listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> { try { successResponse(res, "Notifications retrieved successfully.", await getNotifications(requireUserId(req))); } catch (error) { next(error); } }
export async function markNotificationsAsRead(req: Request, res: Response, next: NextFunction): Promise<void> { try { const { notificationIds } = markNotificationsReadSchema.parse(req.body); const markedCount = await markRead(requireUserId(req), notificationIds); successResponse(res, "Notifications marked as read.", { markedCount }); } catch (error) { next(error); } }
