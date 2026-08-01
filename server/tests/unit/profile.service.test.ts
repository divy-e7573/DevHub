import type { HydratedDocument } from "mongoose";
import type { IProfile } from "../../src/models/Profile";
import type { IUser } from "../../src/models/User";
import { findUserById, findUserByUsername } from "../../src/repositories/user.repository";
import {
  findProfileByUserId,
  updateProfileByUserId,
} from "../../src/repositories/profile.repository";
import {
  getPublicProfile,
  updateCurrentProfile,
} from "../../src/services/profile.service";
import { getFollowStats } from "../../src/repositories/follow.repository";

jest.mock("../../src/repositories/user.repository", () => ({
  findUserById: jest.fn(),
  findUserByUsername: jest.fn(),
}));
jest.mock("../../src/repositories/profile.repository", () => ({
  findProfileByUserId: jest.fn(),
  updateProfileByUserId: jest.fn(),
}));
jest.mock("../../src/repositories/follow.repository", () => ({ getFollowStats: jest.fn() }));

const findUserByUsernameMock = jest.mocked(findUserByUsername);
const findUserByIdMock = jest.mocked(findUserById);
const findProfileByUserIdMock = jest.mocked(findProfileByUserId);
const updateProfileByUserIdMock = jest.mocked(updateProfileByUserId);
const getFollowStatsMock = jest.mocked(getFollowStats);

function createUser(): HydratedDocument<IUser> {
  return {
    _id: { toString: () => "507f1f77bcf86cd799439011" },
    name: "Ada Lovelace",
    username: "ada_lovelace",
    email: "ada@example.com",
    password: "hashed-password",
    role: "user",
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as HydratedDocument<IUser>;
}

function createProfile(): HydratedDocument<IProfile> {
  return {
    bio: "First programmer.",
    location: "London",
    skills: ["Mathematics"],
    experience: [],
    education: [],
    portfolio: [],
    socialLinks: { github: "https://github.com/ada" },
    avatarUrl: "https://images.example.com/avatar.jpg",
    createdAt: new Date("2026-08-01T00:00:00.000Z"),
    updatedAt: new Date("2026-08-01T00:00:00.000Z"),
  } as unknown as HydratedDocument<IProfile>;
}

describe("profile service", () => {
  beforeEach(() => jest.resetAllMocks());

  it("returns only public account fields with profile data", async () => {
    findUserByUsernameMock.mockResolvedValue(createUser());
    findProfileByUserIdMock.mockResolvedValue(createProfile());
    getFollowStatsMock.mockResolvedValue({ followersCount: 0, followingCount: 0, isFollowing: false });

    const profile = await getPublicProfile("ada_lovelace");

    expect(profile).toEqual({
      user: {
        id: "507f1f77bcf86cd799439011",
        name: "Ada Lovelace",
        username: "ada_lovelace",
      },
      bio: "First programmer.",
      location: "London",
      skills: ["Mathematics"],
      experience: [],
      education: [],
      portfolio: [],
      socialLinks: { github: "https://github.com/ada" },
      avatarUrl: "https://images.example.com/avatar.jpg",
      coverImageUrl: undefined,
      createdAt: new Date("2026-08-01T00:00:00.000Z"),
      updatedAt: new Date("2026-08-01T00:00:00.000Z"),
      followersCount: 0,
      followingCount: 0,
      isFollowing: false,
    });
    expect(JSON.stringify(profile)).not.toContain("hashed-password");
    expect(JSON.stringify(profile)).not.toContain("ada@example.com");
  });

  it("creates or updates the authenticated user's one-to-one profile", async () => {
    const user = createUser();
    const persistedProfile = createProfile();
    findUserByIdMock.mockResolvedValue(user);
    updateProfileByUserIdMock.mockResolvedValue(persistedProfile);
    getFollowStatsMock.mockResolvedValue({ followersCount: 0, followingCount: 0, isFollowing: false });
    const input = { bio: "First programmer." };

    await expect(updateCurrentProfile("507f1f77bcf86cd799439011", input)).resolves.toMatchObject({
      user: { username: "ada_lovelace" },
      bio: "First programmer.",
    });
    expect(updateProfileByUserIdMock).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      input,
    );
  });
});
