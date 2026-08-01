import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { successResponse } from "../utils/response";
import {
  getPublicProfile,
  updateCurrentProfile,
  updateProfileImage,
} from "../services/profile.service";
import { updateProfileSchema } from "../validators/profile.validator";
import { usernameSchema } from "../validators/auth.validator";
import { uploadProfileImage, type ProfileImageKind } from "../utils/cloudinary";

function requireAuthenticatedUser(req: Request): string {
  if (!req.user) {
    throw new AppError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
  }

  return req.user.id;
}

export async function getByUsername(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await getPublicProfile(usernameSchema.parse(req.params.username), req.user?.id);
    successResponse(res, "Profile retrieved successfully.", { profile });
  } catch (error) {
    next(error);
  }
}

export async function updateMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await updateCurrentProfile(
      requireAuthenticatedUser(req),
      updateProfileSchema.parse(req.body),
    );
    successResponse(res, "Profile updated successfully.", { profile });
  } catch (error) {
    next(error);
  }
}

export function uploadImage(kind: ProfileImageKind) {
  return async function uploadProfileImageHandler(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = requireAuthenticatedUser(req);

      if (!req.file) {
        throw new AppError("An image file is required.", 400, "IMAGE_REQUIRED");
      }

      const image = await uploadProfileImage(req.file, kind);
      const profile = await updateProfileImage(
        userId,
        kind === "avatar" ? "avatarUrl" : "coverImageUrl",
        image.url,
      );
      successResponse(res, "Profile image uploaded successfully.", { profile });
    } catch (error) {
      next(error);
    }
  };
}
