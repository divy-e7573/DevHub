import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(
    new AppError("Route not found.", 404, "ROUTE_NOT_FOUND", {
      method: req.method,
      path: req.originalUrl,
    })
  );
}
