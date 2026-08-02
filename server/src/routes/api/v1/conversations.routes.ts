import { Router } from "express";
import { listConversations, listMessages } from "../../../controllers/conversation.controller";
import { authenticate } from "../../../middleware/auth.middleware";
export const conversationsRouter = Router();
conversationsRouter.get("/", authenticate, listConversations);
conversationsRouter.get("/:id/messages", authenticate, listMessages);
