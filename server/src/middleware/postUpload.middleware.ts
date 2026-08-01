import multer from "multer";
import { AppError } from "../utils/AppError";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const postImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      callback(new AppError("Only JPEG, PNG, and WebP images are supported.", 400, "INVALID_IMAGE_TYPE"));
      return;
    }
    callback(null, true);
  },
});
