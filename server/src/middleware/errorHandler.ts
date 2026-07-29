import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import type { ErrorDetails, NormalizedError } from "../types/errors";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { errorResponse } from "../utils/response";

interface IDuplicateKeyError {
  code: number;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
}

function normalizeZodError(error: ZodError): NormalizedError {
  const details: ErrorDetails = error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
    type: issue.code,
  }));

  return {
    statusCode: 400,
    message: "Request validation failed.",
    code: "VALIDATION_ERROR",
    details,
  };
}

function normalizeMongooseValidationError(
  error: mongoose.Error.ValidationError,
): NormalizedError {
  const details: ErrorDetails = Object.values(error.errors).map(
    (validationError) => ({
      field: validationError.path,
      message: validationError.message,
      type: validationError.kind,
    }),
  );

  return {
    statusCode: 400,
    message: "Data validation failed.",
    code: "VALIDATION_ERROR",
    details,
  };
}

function normalizeCastError(error: mongoose.Error.CastError): NormalizedError {
  return {
    statusCode: 400,
    message: `Invalid value for field '${error.path}'.`,
    code: "CAST_ERROR",
    details: {
      field: error.path,
      expectedType: error.kind,
    },
  };
}

function isDuplicateKeyError(error: unknown): error is IDuplicateKeyError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function normalizeDuplicateKeyError(
  error: IDuplicateKeyError,
): NormalizedError {
  const duplicateFields = Object.keys(error.keyValue ?? error.keyPattern ?? {});

  return {
    statusCode: 409,
    message: "A record with the supplied value already exists.",
    code: "DUPLICATE_KEY_ERROR",
    details: {
      fields: duplicateFields,
    },
  };
}

function isMalformedJsonError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400 &&
    "type" in error &&
    error.type === "entity.parse.failed"
  );
}

function normalizeError(error: unknown): NormalizedError {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
      details: error.details,
    };
  }

  if (error instanceof ZodError) {
    return normalizeZodError(error);
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return normalizeMongooseValidationError(error);
  }

  if (error instanceof mongoose.Error.CastError) {
    return normalizeCastError(error);
  }

  if (isDuplicateKeyError(error)) {
    return normalizeDuplicateKeyError(error);
  }

  // JWT handling is intentionally name-based until authentication and its JWT
  // dependency are introduced. No token verification is implemented here.
  if (error instanceof Error && error.name === "TokenExpiredError") {
    return {
      statusCode: 401,
      message: "Token has expired.",
      code: "TOKEN_EXPIRED",
      details: null,
    };
  }

  if (error instanceof Error && error.name === "JsonWebTokenError") {
    return {
      statusCode: 401,
      message: "Invalid token.",
      code: "INVALID_TOKEN",
      details: null,
    };
  }

  if (isMalformedJsonError(error)) {
    return {
      statusCode: 400,
      message: "Request body contains invalid JSON.",
      code: "INVALID_JSON",
      details: null,
    };
  }

  return {
    statusCode: 500,
    message: "Internal Server Error",
    code: "INTERNAL_SERVER_ERROR",
    details: null,
  };
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  const normalizedError = normalizeError(error);
  const logContext = {
    method: req.method,
    path: req.originalUrl,
    statusCode: normalizedError.statusCode,
    code: normalizedError.code,
  };

  if (normalizedError.statusCode >= 500) {
    logger.error("Unhandled request error", { error, ...logContext });
  } else {
    logger.warn("Request failed", logContext);
  }

  errorResponse(res, {
    statusCode: normalizedError.statusCode,
    message: normalizedError.message,
    code: normalizedError.code,
    details: normalizedError.details,
  });
}
