import rateLimit from "express-rate-limit";
import { config } from "../config/config";
import { AppError } from "../utils/AppError";

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.maxRequests,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new AppError(
        "Too many requests. Please try again later.",
        429,
        "RATE_LIMIT_EXCEEDED",
      ),
    );
  },
});
