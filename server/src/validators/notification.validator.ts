import { z } from "zod";

export const markNotificationsReadSchema = z.object({
  notificationIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1).max(100),
}).strict();
