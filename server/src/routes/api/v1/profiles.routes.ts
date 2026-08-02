import { Router } from "express";
import {
  getByUsername,
  updateMe,
  uploadImage,
  syncGitHub,
  uploadResumeFile,
} from "../../../controllers/profile.controller";
import { authenticate, optionallyAuthenticate } from "../../../middleware/auth.middleware";
import { profileImageUpload } from "../../../middleware/profileUpload.middleware";
import { resumeUpload } from "../../../middleware/resumeUpload.middleware";

export const profilesRouter = Router();

profilesRouter.get("/:username", optionallyAuthenticate, getByUsername);
profilesRouter.put("/me", authenticate, updateMe);
profilesRouter.post("/github/sync", authenticate, syncGitHub);
profilesRouter.post("/resume", authenticate, resumeUpload.single("resume"), uploadResumeFile);
profilesRouter.post(
  "/me/avatar",
  authenticate,
  profileImageUpload.single("image"),
  uploadImage("avatar"),
);
profilesRouter.post(
  "/me/cover-image",
  authenticate,
  profileImageUpload.single("image"),
  uploadImage("cover"),
);
