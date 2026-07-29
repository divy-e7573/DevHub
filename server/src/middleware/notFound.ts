// 404 handler for unmatched routes.
//
// Registered after all routes in `app.ts`. Any request that reaches here did
// not match a defined route, so we hand a structured 404 to the error
// pipeline rather than Express's default HTML page.

import { Request, Response } from "express";

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: { message: `Not Found - ${req.method} ${req.originalUrl}` },
  });
}
