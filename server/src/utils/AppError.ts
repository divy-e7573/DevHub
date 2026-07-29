import type { ErrorDetails } from "../types/errors";

/**
 * Represents an expected operational failure that is safe to return to an API
 * consumer. Programming errors and unexpected failures should remain regular
 * errors so the global handler can mask their internal details.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: ErrorDetails;
  public readonly isOperational = true;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details: ErrorDetails = null
  ) {
    super(message);

    if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) {
      throw new TypeError("AppError statusCode must be an integer from 400 to 599.");
    }

    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, AppError);
  }
}
