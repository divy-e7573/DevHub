import type { NextFunction, Request, Response } from "express";
import { successResponse } from "../utils/response";
import { search } from "../services/search.service";
import { searchQuerySchema } from "../validators/search.validator";

export async function searchAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { successResponse(res, "Search completed successfully.", await search(searchQuerySchema.parse(req.query), req.user?.id)); }
  catch (error) { next(error); }
}
