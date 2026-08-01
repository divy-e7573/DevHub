import { findUserById } from "../../src/repositories/user.repository";
import { createFollow, getFollowStats } from "../../src/repositories/follow.repository";
import { followUser } from "../../src/services/follow.service";

jest.mock("../../src/repositories/user.repository", () => ({ findUserById: jest.fn() }));
jest.mock("../../src/repositories/follow.repository", () => ({
  createFollow: jest.fn(), deleteFollow: jest.fn(), findFollowers: jest.fn(), findFollowing: jest.fn(), getFollowStats: jest.fn(),
}));

const findUserByIdMock = jest.mocked(findUserById);
const createFollowMock = jest.mocked(createFollow);
const getFollowStatsMock = jest.mocked(getFollowStats);

describe("follow service", () => {
  beforeEach(() => jest.resetAllMocks());
  it("rejects an attempted self-follow before querying the database", async () => {
    await expect(followUser("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439011")).rejects.toMatchObject({ statusCode: 400, code: "SELF_FOLLOW_NOT_ALLOWED" });
    expect(findUserByIdMock).not.toHaveBeenCalled();
  });
  it("creates a directed follow and returns the updated relationship", async () => {
    findUserByIdMock.mockResolvedValue({ _id: { toString: () => "507f1f77bcf86cd799439012" } } as never);
    createFollowMock.mockResolvedValue({} as never);
    getFollowStatsMock.mockResolvedValue({ followersCount: 7, followingCount: 3, isFollowing: true });
    await expect(followUser("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012")).resolves.toEqual({ followingId: "507f1f77bcf86cd799439012", isFollowing: true, followersCount: 7 });
    expect(createFollowMock).toHaveBeenCalledWith("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012");
  });
});
