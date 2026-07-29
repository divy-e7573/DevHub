import type { Response } from "express";
import {
  badRequestResponse,
  createdResponse,
  forbiddenResponse,
  internalServerErrorResponse,
  notFoundResponse,
  successResponse,
  unauthorizedResponse,
} from "../../src/utils/response";

interface MockResponse {
  response: Response;
  status: jest.Mock;
  json: jest.Mock;
}

function createMockResponse(): MockResponse {
  const status = jest.fn();
  const json = jest.fn();
  const response = { status, json } as unknown as Response;

  status.mockReturnValue(response);
  json.mockReturnValue(response);

  return { response, status, json };
}

describe("response helpers", () => {
  it("sends a success response with typed data", () => {
    const { response, status, json } = createMockResponse();
    const data = { id: "user-1" };

    successResponse(response, "User retrieved", data);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      success: true,
      message: "User retrieved",
      data,
    });
  });

  it("omits data when a success response has no payload", () => {
    const { response, json } = createMockResponse();

    successResponse(response, "DevHub API Running");

    expect(json).toHaveBeenCalledWith({
      success: true,
      message: "DevHub API Running",
    });
  });

  it("sends a created response", () => {
    const { response, status, json } = createMockResponse();
    const data = { id: "post-1" };

    createdResponse(response, "Post created", data);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({
      success: true,
      message: "Post created",
      data,
    });
  });

  it.each([
    [badRequestResponse, 400, "Bad Request", "BAD_REQUEST"],
    [unauthorizedResponse, 401, "Unauthorized", "UNAUTHORIZED"],
    [forbiddenResponse, 403, "Forbidden", "FORBIDDEN"],
    [notFoundResponse, 404, "Not Found", "NOT_FOUND"],
  ])(
    "sends the expected standard error envelope",
    (helper, expectedStatus, expectedMessage, expectedCode) => {
      const { response, status, json } = createMockResponse();

      helper(response);

      expect(status).toHaveBeenCalledWith(expectedStatus);
      expect(json).toHaveBeenCalledWith({
        success: false,
        message: expectedMessage,
        error: {
          code: expectedCode,
          details: null,
        },
      });
    },
  );

  it("supports safe custom error context", () => {
    const { response, json } = createMockResponse();

    badRequestResponse(response, "Request validation failed.", {
      code: "VALIDATION_ERROR",
      details: [{ field: "email", message: "Invalid email" }],
    });

    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "Request validation failed.",
      error: {
        code: "VALIDATION_ERROR",
        details: [{ field: "email", message: "Invalid email" }],
      },
    });
  });

  it("masks internal server errors", () => {
    const { response, status, json } = createMockResponse();

    internalServerErrorResponse(response);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        details: null,
      },
    });
  });
});
