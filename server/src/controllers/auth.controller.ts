import type { NextFunction, Request, Response } from "express";
import { registerUser } from "../services/auth.service";
import { createdResponse } from "../utils/response";
import { registerUserSchema } from "../validators/auth.validator";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = registerUserSchema.parse(req.body);
    const user = await registerUser(input);

    createdResponse(res, "User registered successfully.", { user });
  } catch (error) {
    next(error);
  }
}
