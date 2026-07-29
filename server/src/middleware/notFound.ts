import type { NextFunction, Request, Response } from "express";

interface INotFoundError extends Error {
  statusCode: number;
}

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  ) as INotFoundError;

  error.statusCode = 404;
  next(error);
}
