// Global error-handling middleware.
//
// Why this exists: a single, consistent error shape for every failure in the
// app. Controllers/services throw (or pass errors via `next(err)`); this is
// the only place that translates an error into an HTTP response.

import { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = 500;
  const message =
    err instanceof Error ? err.message : "Internal Server Error";

  // TODO: map known error types to specific status codes, and hide internals
  // behind a generic message in production.
  res.status(status).json({
    success: false,
    error: { message },
  });
}
