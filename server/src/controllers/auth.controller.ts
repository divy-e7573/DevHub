import type { NextFunction, Request, Response } from "express";
import { authCookieOptions } from "../config/auth";
import { config } from "../config/config";
import { loginUser, registerUser } from "../services/auth.service";
import { createdResponse, successResponse } from "../utils/response";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validators/auth.validator";

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

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = loginUserSchema.parse(req.body);
    const { token, user } = await loginUser(input);

    res.cookie(config.auth.cookie.name, token, authCookieOptions);
    successResponse(res, "Logged in successfully.", { user });
  } catch (error) {
    next(error);
  }
}
