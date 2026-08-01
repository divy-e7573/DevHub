import { compare } from "bcrypt";
import { sign, type SignOptions } from "jsonwebtoken";
import type { HydratedDocument } from "mongoose";
import { config } from "../../src/config/config";
import type { IUser } from "../../src/models/User";
import { findUserByEmailWithPassword } from "../../src/repositories/user.repository";
import { loginUser } from "../../src/services/auth.service";

jest.mock("bcrypt", () => ({ compare: jest.fn(), hash: jest.fn() }));
jest.mock("jsonwebtoken", () => ({ sign: jest.fn() }));
jest.mock("../../src/repositories/user.repository", () => ({
  createUser: jest.fn(),
  emailExists: jest.fn(),
  findUserByEmailWithPassword: jest.fn(),
  usernameExists: jest.fn(),
}));

const compareMock = compare as unknown as jest.MockedFunction<
  (password: string, encryptedPassword: string) => Promise<boolean>
>;
const signMock = sign as unknown as jest.MockedFunction<
  (payload: object, secret: string, options: SignOptions) => string
>;
const findUserByEmailWithPasswordMock = jest.mocked(findUserByEmailWithPassword);

const loginInput = {
  email: "ada@example.com",
  password: "correct horse battery staple",
};

function createPersistedUser(): HydratedDocument<IUser> {
  return {
    _id: { toString: () => "507f1f77bcf86cd799439011" },
    name: "Ada Lovelace",
    username: "ada_lovelace",
    email: loginInput.email,
    password: "hashed-password",
    role: "user",
    isEmailVerified: false,
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
  } as unknown as HydratedDocument<IUser>;
}

describe("loginUser", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("loads the hidden password, verifies it, signs a token, and returns safe user data", async () => {
    findUserByEmailWithPasswordMock.mockResolvedValue(createPersistedUser());
    compareMock.mockResolvedValue(true);
    signMock.mockReturnValue("signed-token");

    await expect(loginUser(loginInput)).resolves.toEqual({
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

    expect(findUserByEmailWithPasswordMock).toHaveBeenCalledWith(
      loginInput.email,
    );
    expect(compareMock).toHaveBeenCalledWith(
      loginInput.password,
      "hashed-password",
    );
    expect(signMock).toHaveBeenCalledWith({ role: "user" }, config.auth.jwt.secret, {
      algorithm: "HS256",
      subject: "507f1f77bcf86cd799439011",
      expiresIn: config.auth.jwt.expiresIn,
    });
  });

  it("returns a generic credential error when no user is found", async () => {
    findUserByEmailWithPasswordMock.mockResolvedValue(null);

    await expect(loginUser(loginInput)).rejects.toMatchObject({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });

    expect(compareMock).not.toHaveBeenCalled();
    expect(signMock).not.toHaveBeenCalled();
  });

  it("returns a generic credential error when the password does not match", async () => {
    findUserByEmailWithPasswordMock.mockResolvedValue(createPersistedUser());
    compareMock.mockResolvedValue(false);

    await expect(loginUser(loginInput)).rejects.toMatchObject({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });

    expect(signMock).not.toHaveBeenCalled();
  });
});
