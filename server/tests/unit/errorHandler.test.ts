import express, { type Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import { z } from "zod";
import { errorHandler } from "../../src/middleware/errorHandler";
import { AppError } from "../../src/utils/AppError";

jest.mock("../../src/utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

function createErrorApp(errorFactory: () => unknown): Express {
  const app = express();

  app.get("/test", () => {
    throw errorFactory();
  });
  app.use(errorHandler);

  return app;
}

describe("global error handler", () => {
  it("returns operational AppError information", async () => {
    const app = createErrorApp(
      () =>
        new AppError("Resource is unavailable.", 503, "RESOURCE_UNAVAILABLE", {
          retryable: true,
        })
    );

    const response = await request(app).get("/test");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      success: false,
      message: "Resource is unavailable.",
      error: {
        code: "RESOURCE_UNAVAILABLE",
        details: { retryable: true },
      },
    });
  });

  it("normalizes Zod validation errors", async () => {
    const app = createErrorApp(() =>
      z.object({ email: z.string().email() }).parse({ email: "invalid" })
    );

    const response = await request(app).get("/test");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.details).toEqual([
      expect.objectContaining({ field: "email" }),
    ]);
  });

  it("normalizes Mongoose validation errors", async () => {
    const app = createErrorApp(() => {
      const validationError = new mongoose.Error.ValidationError();
      validationError.addError(
        "name",
        new mongoose.Error.ValidatorError({
          message: "Name is required.",
          path: "name",
          type: "required",
        })
      );
      return validationError;
    });

    const response = await request(app).get("/test");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.details).toEqual([
      {
        field: "name",
        message: "Name is required.",
        type: "required",
      },
    ]);
  });

  it("normalizes Mongoose cast errors", async () => {
    const app = createErrorApp(
      () => new mongoose.Error.CastError("ObjectId", "invalid", "userId")
    );

    const response = await request(app).get("/test");

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual({
      code: "CAST_ERROR",
      details: {
        field: "userId",
        expectedType: "ObjectId",
      },
    });
  });

  it("normalizes duplicate key errors without exposing duplicate values", async () => {
    const app = createErrorApp(() => ({
      name: "MongoServerError",
      code: 11000,
      keyValue: { email: "private@example.com" },
    }));

    const response = await request(app).get("/test");

    expect(response.status).toBe(409);
    expect(response.body.error).toEqual({
      code: "DUPLICATE_KEY_ERROR",
      details: { fields: ["email"] },
    });
    expect(JSON.stringify(response.body)).not.toContain("private@example.com");
  });

  it.each([
    ["TokenExpiredError", "TOKEN_EXPIRED", "Token has expired."],
    ["JsonWebTokenError", "INVALID_TOKEN", "Invalid token."],
  ])("normalizes the %s JWT placeholder", async (name, code, message) => {
    const app = createErrorApp(() => {
      const error = new Error("JWT library detail");
      error.name = name;
      return error;
    });

    const response = await request(app).get("/test");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message,
      error: { code, details: null },
    });
  });

  it("masks unknown server errors", async () => {
    const app = createErrorApp(() => new Error("Private implementation detail"));

    const response = await request(app).get("/test");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        details: null,
      },
    });
    expect(JSON.stringify(response.body)).not.toContain(
      "Private implementation detail"
    );
  });
});
