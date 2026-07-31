import { hash } from "bcrypt";
import type { HydratedDocument } from "mongoose";
import type { IUser } from "../../src/models/User";
import {
  createUser,
  emailExists,
  usernameExists,
} from "../../src/repositories/user.repository";
import { registerUser } from "../../src/services/auth.service";

jest.mock("bcrypt", () => ({ hash: jest.fn() }));
jest.mock("../../src/repositories/user.repository", () => ({
  createUser: jest.fn(),
  emailExists: jest.fn(),
  usernameExists: jest.fn(),
}));

const hashMock = hash as unknown as jest.MockedFunction<
  (password: string, saltRounds: number) => Promise<string>
>;
const createUserMock = jest.mocked(createUser);
const emailExistsMock = jest.mocked(emailExists);
const usernameExistsMock = jest.mocked(usernameExists);

const registrationInput = {
  name: "Ada Lovelace",
  username: "ada_lovelace",
  email: "ada@example.com",
  password: "correct horse battery staple",
};

function createPersistedUser(): HydratedDocument<IUser> {
  return {
    _id: { toString: () => "507f1f77bcf86cd799439011" },
    name: registrationInput.name,
    username: registrationInput.username,
    email: registrationInput.email,
    password: "hashed-password",
    role: "user",
    isEmailVerified: false,
    createdAt: new Date("2026-07-31T00:00:00.000Z"),
    updatedAt: new Date("2026-07-31T00:00:00.000Z"),
  } as unknown as HydratedDocument<IUser>;
}

describe("registerUser", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("checks uniqueness, hashes the password, creates the user, and returns safe data", async () => {
    const persistedUser = createPersistedUser();
    emailExistsMock.mockResolvedValue(false);
    usernameExistsMock.mockResolvedValue(false);
    hashMock.mockResolvedValue("hashed-password");
    createUserMock.mockResolvedValue(persistedUser);

    await expect(registerUser(registrationInput)).resolves.toEqual({
      id: "507f1f77bcf86cd799439011",
      name: "Ada Lovelace",
      username: "ada_lovelace",
      email: "ada@example.com",
      role: "user",
      isEmailVerified: false,
      createdAt: new Date("2026-07-31T00:00:00.000Z"),
      updatedAt: new Date("2026-07-31T00:00:00.000Z"),
    });

    expect(emailExistsMock).toHaveBeenCalledWith(registrationInput.email);
    expect(usernameExistsMock).toHaveBeenCalledWith(
      registrationInput.username,
    );
    expect(hashMock).toHaveBeenCalledWith(registrationInput.password, 12);
    expect(createUserMock).toHaveBeenCalledWith({
      name: registrationInput.name,
      username: registrationInput.username,
      email: registrationInput.email,
      password: "hashed-password",
    });
  });

  it("stops when the email is already registered", async () => {
    emailExistsMock.mockResolvedValue(true);

    await expect(registerUser(registrationInput)).rejects.toMatchObject({
      statusCode: 409,
      code: "EMAIL_ALREADY_EXISTS",
    });

    expect(usernameExistsMock).not.toHaveBeenCalled();
    expect(hashMock).not.toHaveBeenCalled();
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("stops when the username is already registered", async () => {
    emailExistsMock.mockResolvedValue(false);
    usernameExistsMock.mockResolvedValue(true);

    await expect(registerUser(registrationInput)).rejects.toMatchObject({
      statusCode: 409,
      code: "USERNAME_ALREADY_EXISTS",
    });

    expect(hashMock).not.toHaveBeenCalled();
    expect(createUserMock).not.toHaveBeenCalled();
  });
});
