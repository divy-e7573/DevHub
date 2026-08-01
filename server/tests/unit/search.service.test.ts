import { searchUsers } from "../../src/repositories/search.repository";
import { findFollowedUserIds } from "../../src/repositories/follow.repository";
import { search } from "../../src/services/search.service";

jest.mock("../../src/repositories/search.repository", () => ({ searchUsers: jest.fn(), searchPosts: jest.fn(), searchSkills: jest.fn() }));
jest.mock("../../src/repositories/follow.repository", () => ({ findFollowedUserIds: jest.fn() }));
jest.mock("../../src/repositories/post.repository", () => ({ findLikedPostIds: jest.fn() }));

const searchUsersMock = jest.mocked(searchUsers);
const findFollowedUserIdsMock = jest.mocked(findFollowedUserIds);

describe("search service", () => {
  beforeEach(() => jest.resetAllMocks());
  it("returns a safe people projection with viewer-specific follow state", async () => {
    searchUsersMock.mockResolvedValue([{ _id: { toString: () => "507f1f77bcf86cd799439012" }, name: "Ada Lovelace", username: "ada_lovelace" }]);
    findFollowedUserIdsMock.mockResolvedValue(new Set(["507f1f77bcf86cd799439012"]));
    await expect(search({ q: "ada", type: "users", limit: 20 }, "507f1f77bcf86cd799439011")).resolves.toEqual({ type: "users", results: [{ id: "507f1f77bcf86cd799439012", name: "Ada Lovelace", username: "ada_lovelace", isFollowing: true }] });
  });
});
