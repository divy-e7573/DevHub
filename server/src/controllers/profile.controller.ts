import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { successResponse } from "../utils/response";
import {
  getPublicProfile,
  updateCurrentProfile,
  updateProfileImage,
  syncGitHubProfile,
  updateResume,
} from "../services/profile.service";
import { updateProfileSchema } from "../validators/profile.validator";
import { usernameSchema } from "../validators/auth.validator";
import { uploadProfileImage, type ProfileImageKind } from "../utils/cloudinary";
import { uploadResume } from "../utils/cloudinary";
import { syncGitHubSchema } from "../validators/github.validator";

function requireAuthenticatedUser(req: Request): string {
  if (!req.user) {
    throw new AppError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
  }

  return req.user.id;
}

export async function syncGitHub(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await syncGitHubProfile(requireAuthenticatedUser(req), syncGitHubSchema.parse(req.body).username);
    successResponse(res, "GitHub profile synced successfully.", { profile });
  } catch (error) { next(error); }
}

export async function uploadResumeFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) throw new AppError("A PDF resume file is required.", 400, "RESUME_REQUIRED");
    if (req.file.buffer.subarray(0, 4).toString("ascii") !== "%PDF") {
      throw new AppError("Only valid PDF resume files are supported.", 400, "INVALID_RESUME_TYPE");
    }
    const uploadedResume = await uploadResume(req.file);
    const profile = await updateResume(requireAuthenticatedUser(req), uploadedResume.url);
    successResponse(res, "Resume uploaded successfully.", { profile });
  } catch (error) { next(error); }
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
