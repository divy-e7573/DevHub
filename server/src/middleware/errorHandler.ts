import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { logger } from "../utils/logger";

interface IApplicationError extends Error {
  status?: number;
  statusCode?: number;
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  const applicationError =
    err instanceof Error ? (err as IApplicationError) : undefined;
  const suppliedStatusCode =
    applicationError?.statusCode ?? applicationError?.status;
  const statusCode =
    typeof suppliedStatusCode === "number" &&
    suppliedStatusCode >= 400 &&
    suppliedStatusCode < 600
      ? suppliedStatusCode
      : 500;
  const message =
    statusCode === 500 && env.NODE_ENV === "production"
      ? "Internal Server Error"
      : applicationError?.message ?? "Internal Server Error";

  if (statusCode >= 500) {
    logger.error("Unhandled request error", err);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} failed with ${statusCode}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}
