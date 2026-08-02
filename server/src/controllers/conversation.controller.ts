import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { successResponse } from "../utils/response";
import { getConversations, getMessages } from "../services/conversation.service";
import { conversationIdParamSchema, cursorPaginationSchema } from "../validators/conversation.validator";
function requireUserId(req: Request): string { if (!req.user) throw new AppError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED"); return req.user.id; }
export async function listConversations(req: Request, res: Response, next: NextFunction): Promise<void> { try { successResponse(res, "Conversations retrieved successfully.", { conversations: await getConversations(requireUserId(req)) }); } catch (error) { next(error); } }
export async function listMessages(req: Request, res: Response, next: NextFunction): Promise<void> { try { const { id } = conversationIdParamSchema.parse(req.params); successResponse(res, "Messages retrieved successfully.", await getMessages(requireUserId(req), id, cursorPaginationSchema.parse(req.query))); } catch (error) { next(error); } }
