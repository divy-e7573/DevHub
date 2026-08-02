import multer from "multer";
import { AppError } from "../utils/AppError";

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      callback(new AppError("Only PDF resume files are supported.", 400, "INVALID_RESUME_TYPE"));
      return;
    }
    callback(null, true);
  },
});
