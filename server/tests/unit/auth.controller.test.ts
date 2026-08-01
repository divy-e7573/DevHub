import express, { type Express } from "express";
import { sign } from "jsonwebtoken";
import request from "supertest";
import { config } from "../../src/config/config";
import { getCurrentUser, loginUser } from "../../src/services/auth.service";

jest.mock("../../src/services/auth.service", () => ({
  getCurrentUser: jest.fn(),
  loginUser: jest.fn(),
  registerUser: jest.fn(),
}));

import { authRouter } from "../../src/routes/api/v1/auth.routes";

const loginUserMock = jest.mocked(loginUser);
const getCurrentUserMock = jest.mocked(getCurrentUser);

function createAuthApp(): Express {
  const app = express();
  app.use(express.json());
  app.use(authRouter);

  return app;
}

describe("POST /login", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("stores the token only in the configured HTTP-only cookie", async () => {
    loginUserMock.mockResolvedValue({
      token: "signed-token",
      user: {
        id: "507f1f77bcf86cd799439011",
        name: "Ada Lovelace",
        username: "ada_lovelace",
        email: "ada@example.com",
        role: "user",
        isEmailVerified: false,
        createdAt: new Date("2026-08-01T00:00:00.000Z"),
        updatedAt: new Date("2026-08-01T00:00:00.000Z"),
      },
    });

    const response = await request(createAuthApp()).post("/login").send({
      email: "ada@example.com",
      password: "correct horse battery staple",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Logged in successfully.",
      data: {
        user: expect.objectContaining({ id: "507f1f77bcf86cd799439011" }),
      },
    });
    expect(JSON.stringify(response.body)).not.toContain("signed-token");
    expect(response.headers["set-cookie"]?.[0]).toEqual(
      expect.stringContaining("devhub_auth=signed-token"),
    );
    expect(response.headers["set-cookie"]?.[0]).toEqual(
      expect.stringContaining("HttpOnly"),
    );
    expect(response.headers["set-cookie"]?.[0]).toEqual(
      expect.stringContaining("SameSite=Lax"),
    );
  });

  it("clears the authentication cookie on logout", async () => {
    const response = await request(createAuthApp()).post("/logout");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Logged out successfully.",
    });
    expect(response.headers["set-cookie"]?.[0]).toEqual(
      expect.stringContaining("devhub_auth="),
    );
    expect(response.headers["set-cookie"]?.[0]).toEqual(
      expect.stringContaining("HttpOnly"),
    );
    expect(response.headers["set-cookie"]?.[0]).toEqual(
      expect.stringContaining("SameSite=Lax"),
    );
  });

  it("returns the current user through the protected endpoint", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
      name: "Ada Lovelace",
      username: "ada_lovelace",
      email: "ada@example.com",
      role: "user",
      isEmailVerified: false,
      createdAt: new Date("2026-08-01T00:00:00.000Z"),
      updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    });
    const token = sign({ role: "user" }, config.auth.jwt.secret, {
      algorithm: "HS256",
      subject: "507f1f77bcf86cd799439011",
      expiresIn: config.auth.jwt.expiresIn,
    });

    const response = await request(createAuthApp())
      .get("/me")
      .set("Cookie", `devhub_auth=${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Current user retrieved successfully.",
      data: {
        user: expect.objectContaining({ id: "507f1f77bcf86cd799439011" }),
      },
    });
    expect(getCurrentUserMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
    );
  });
});
