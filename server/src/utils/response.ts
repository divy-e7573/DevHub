import type { Response } from "express";
import type { ErrorDetails, ErrorResponsePayload } from "../types/errors";
import type { SuccessResponsePayload } from "../types/responses";

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

interface ErrorResponseOptions {
  code?: string;
  details?: ErrorDetails;
}

interface SendErrorResponseOptions extends ErrorResponseOptions {
  statusCode: number;
  message: string;
  code: string;
}

function sendSuccessResponse<TData>(
  res: Response,
  statusCode: number,
  message: string,
  data?: TData,
): Response<SuccessResponsePayload<TData>> {
  const payload: SuccessResponsePayload<TData> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
}

/** Sends a successful response with HTTP 200. */
export function successResponse<TData = unknown>(
  res: Response,
  message: string,
  data?: TData,
): Response<SuccessResponsePayload<TData>> {
  return sendSuccessResponse(res, HTTP_STATUS.OK, message, data);
}

/** Sends a successful resource-creation response with HTTP 201. */
export function createdResponse<TData = unknown>(
  res: Response,
  message: string,
  data?: TData,
): Response<SuccessResponsePayload<TData>> {
  return sendSuccessResponse(res, HTTP_STATUS.CREATED, message, data);
}

/**
 * Sends the standard error envelope. Prefer the named helpers below when a
 * request maps directly to one of their HTTP statuses.
 */
export function errorResponse(
  res: Response,
  options: SendErrorResponseOptions,
): Response<ErrorResponsePayload> {
  const payload: ErrorResponsePayload = {
    success: false,
    message: options.message,
    error: {
      code: options.code,
      details: options.details ?? null,
    },
  };

  return res.status(options.statusCode).json(payload);
}

export function badRequestResponse(
  res: Response,
  message = "Bad Request",
  options: ErrorResponseOptions = {},
): Response<ErrorResponsePayload> {
  return errorResponse(res, {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message,
    code: options.code ?? "BAD_REQUEST",
    details: options.details,
  });
}

export function unauthorizedResponse(
  res: Response,
  message = "Unauthorized",
  options: ErrorResponseOptions = {},
): Response<ErrorResponsePayload> {
  return errorResponse(res, {
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    message,
    code: options.code ?? "UNAUTHORIZED",
    details: options.details,
  });
}

export function forbiddenResponse(
  res: Response,
  message = "Forbidden",
  options: ErrorResponseOptions = {},
): Response<ErrorResponsePayload> {
  return errorResponse(res, {
    statusCode: HTTP_STATUS.FORBIDDEN,
    message,
    code: options.code ?? "FORBIDDEN",
    details: options.details,
  });
}

export function notFoundResponse(
  res: Response,
  message = "Not Found",
  options: ErrorResponseOptions = {},
): Response<ErrorResponsePayload> {
  return errorResponse(res, {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message,
    code: options.code ?? "NOT_FOUND",
    details: options.details,
  });
}

/** Sends a masked HTTP 500 response without exposing error details. */
export function internalServerErrorResponse(
  res: Response,
): Response<ErrorResponsePayload> {
  return errorResponse(res, {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: "Internal Server Error",
    code: "INTERNAL_SERVER_ERROR",
  });
}
