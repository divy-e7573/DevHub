import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { createdResponse, successResponse } from "../utils/response";
import {
  addComment,
  createPost,
  deletePost,
  getComments,
  getFeed,
  likePost,
  unlikePost,
} from "../services/post.service";
import {
  createCommentSchema,
  createPostSchema,
  cursorPaginationSchema,
  postIdParamSchema,
} from "../validators/post.validator";
import { uploadPostImages } from "../utils/cloudinary";

function requireUserId(req: Request): string {
  if (!req.user) throw new AppError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
  return req.user.id;
}

function uploadedFiles(req: Request): Express.Multer.File[] {
  return Array.isArray(req.files) ? req.files : [];
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createPostSchema.parse(req.body);
    const mediaUrls = await uploadPostImages(uploadedFiles(req));
    const post = await createPost(requireUserId(req), input, mediaUrls);
    createdResponse(res, "Post created successfully.", { post });
  } catch (error) { next(error); }
}

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const feed = await getFeed(cursorPaginationSchema.parse(req.query), req.user?.id);
    successResponse(res, "Feed retrieved successfully.", feed);
  } catch (error) { next(error); }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = postIdParamSchema.parse(req.params);
    await deletePost(id, requireUserId(req));
    successResponse(res, "Post deleted successfully.");
  } catch (error) { next(error); }
}

export function changeLike(isAdding: boolean) {
  return async function changePostLike(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = postIdParamSchema.parse(req.params);
      const post = isAdding ? await likePost(id, requireUserId(req)) : await unlikePost(id, requireUserId(req));
      successResponse(res, isAdding ? "Post liked successfully." : "Post unliked successfully.", { post });
    } catch (error) { next(error); }
  };
}

export async function createComment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = postIdParamSchema.parse(req.params);
    const comment = await addComment(id, requireUserId(req), createCommentSchema.parse(req.body));
    createdResponse(res, "Comment added successfully.", { comment });
  } catch (error) { next(error); }
}

export async function listComments(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = postIdParamSchema.parse(req.params);
    const comments = await getComments(id, cursorPaginationSchema.parse(req.query));
    successResponse(res, "Comments retrieved successfully.", comments);
  } catch (error) { next(error); }
}
