import express, { type Express } from "express";
import {
  JsonWebTokenError,
  TokenExpiredError,
  verify,
  type JwtPayload,
  type VerifyOptions,
} from "jsonwebtoken";
import request from "supertest";
import { authenticate } from "../../src/middleware/auth.middleware";
import { errorHandler } from "../../src/middleware/errorHandler";

jest.mock("jsonwebtoken", () => {
  const actual = jest.requireActual<typeof import("jsonwebtoken")>(
    "jsonwebtoken",
  );

  return {
    ...actual,
    verify: jest.fn(),
  };
});

const verifyMock = verify as unknown as jest.MockedFunction<
  (token: string, secret: string, options: VerifyOptions) => JwtPayload | string
>;

function createProtectedApp(): Express {
  const app = express();

  app.get("/protected", authenticate, (req, res) => {
    res.status(200).json({ success: true, data: { user: req.user } });
  });
  app.use(errorHandler);

  return app;
}

describe("authenticate", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("verifies a valid cookie token and attaches its payload to the request", async () => {
    verifyMock.mockReturnValue({
      sub: "507f1f77bcf86cd799439011",
      role: "user",
    });

    const response = await request(createProtectedApp())
      .get("/protected")
      .set("Cookie", "devhub_auth=signed-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        user: {
          id: "507f1f77bcf86cd799439011",
          role: "user",
        },
      },
    });
    expect(verifyMock).toHaveBeenCalledWith(
      "signed-token",
      expect.any(String),
      { algorithms: ["HS256"] },
    );
  });

  it("rejects requests without an authentication cookie", async () => {
    const response = await request(createProtectedApp()).get("/protected");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it("returns a typed error for expired tokens", async () => {
    verifyMock.mockImplementation(() => {
      throw new TokenExpiredError("jwt expired", new Date());
    });

    const response = await request(createProtectedApp())
      .get("/protected")
      .set("Cookie", "devhub_auth=expired-token");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("TOKEN_EXPIRED");
  });

  it("returns a typed error for malformed tokens", async () => {
    verifyMock.mockImplementation(() => {
      throw new JsonWebTokenError("invalid token");
    });

    const response = await request(createProtectedApp())
      .get("/protected")
      .set("Cookie", "devhub_auth=invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_TOKEN");
  });
});
