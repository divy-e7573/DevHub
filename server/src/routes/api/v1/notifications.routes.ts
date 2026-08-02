import { Router } from "express";
import { listNotifications, markNotificationsAsRead } from "../../../controllers/notification.controller";
import { authenticate } from "../../../middleware/auth.middleware";
export const notificationsRouter = Router();
notificationsRouter.get("/", authenticate, listNotifications);
notificationsRouter.patch("/read", authenticate, markNotificationsAsRead);
