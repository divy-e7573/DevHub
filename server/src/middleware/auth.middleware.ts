import type { NextFunction, Request, Response } from "express";
import { TokenExpiredError, verify, type JwtPayload } from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import { config } from "../config/config";
import { USER_ROLES, type UserRole } from "../models/User";
import { AppError } from "../utils/AppError";

function getCookieValue(
  cookieHeader: string | undefined,
  cookieName: string,
): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  for (const cookie of cookieHeader.split(";")) {
    const separatorIndex = cookie.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = cookie.slice(0, separatorIndex).trim();

    if (name === cookieName) {
      return cookie.slice(separatorIndex + 1).trim();
    }
  }

  return undefined;
}

function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    USER_ROLES.includes(value as UserRole)
  );
}

function isValidAuthPayload(
  payload: JwtPayload,
): payload is JwtPayload & { sub: string; role: UserRole } {
  return (
    typeof payload.sub === "string" &&
    isValidObjectId(payload.sub) &&
    isUserRole(payload.role)
  );
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = getCookieValue(req.headers.cookie, config.auth.cookie.name);

  if (!token) {
    next(
      new AppError(
        "Authentication is required.",
        401,
        "AUTHENTICATION_REQUIRED",
      ),
    );
    return;
  }

  try {
    const decoded = verify(token, config.auth.jwt.secret, {
      algorithms: ["HS256"],
    });

    if (typeof decoded === "string" || !isValidAuthPayload(decoded)) {
      next(new AppError("Invalid authentication token.", 401, "INVALID_TOKEN"));
      return;
    }

    req.user = {
      id: decoded.sub,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      next(new AppError("Authentication token has expired.", 401, "TOKEN_EXPIRED"));
      return;
    }

    next(new AppError("Invalid authentication token.", 401, "INVALID_TOKEN"));
  }
}

/** Attaches a verified user when a cookie is present, while preserving public routes. */
export function optionallyAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = getCookieValue(req.headers.cookie, config.auth.cookie.name);

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = verify(token, config.auth.jwt.secret, { algorithms: ["HS256"] });
    if (typeof decoded === "string" || !isValidAuthPayload(decoded)) {
      next(new AppError("Invalid authentication token.", 401, "INVALID_TOKEN"));
      return;
    }
    req.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      next(new AppError("Authentication token has expired.", 401, "TOKEN_EXPIRED"));
      return;
    }
    next(new AppError("Invalid authentication token.", 401, "INVALID_TOKEN"));
  }
}
