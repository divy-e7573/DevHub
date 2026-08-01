import { Router } from "express";
import {
  getByUsername,
  updateMe,
  uploadImage,
} from "../../../controllers/profile.controller";
import { authenticate } from "../../../middleware/auth.middleware";
import { profileImageUpload } from "../../../middleware/profileUpload.middleware";

export const profilesRouter = Router();

profilesRouter.get("/:username", getByUsername);
profilesRouter.put("/me", authenticate, updateMe);
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
