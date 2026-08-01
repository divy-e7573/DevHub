import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { successResponse } from "../utils/response";
import { followUser, getFollowers, getFollowing, unfollowUser } from "../services/follow.service";
import { followCursorSchema, userIdParamSchema } from "../validators/follow.validator";

function requireUserId(req: Request): string {
  if (!req.user) throw new AppError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
  return req.user.id;
}

export function changeFollow(isFollowing: boolean) {
  return async function changeUserFollow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = userIdParamSchema.parse(req.params);
      const relationship = isFollowing ? await followUser(requireUserId(req), id) : await unfollowUser(requireUserId(req), id);
      successResponse(res, isFollowing ? "User followed successfully." : "User unfollowed successfully.", { relationship });
    } catch (error) { next(error); }
  };
}

export async function listFollowers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { const { id } = userIdParamSchema.parse(req.params); successResponse(res, "Followers retrieved successfully.", await getFollowers(id, followCursorSchema.parse(req.query))); }
  catch (error) { next(error); }
}

export async function listFollowing(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { const { id } = userIdParamSchema.parse(req.params); successResponse(res, "Following retrieved successfully.", await getFollowing(id, followCursorSchema.parse(req.query))); }
  catch (error) { next(error); }
}
