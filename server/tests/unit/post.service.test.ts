import {
  createPostRecord,
  findFeedPosts,
  findLikedPostIds,
} from "../../src/repositories/post.repository";
import { createPost, getFeed } from "../../src/services/post.service";

jest.mock("../../src/repositories/post.repository", () => ({
  createCommentRecord: jest.fn(),
  createLike: jest.fn(),
  createPostRecord: jest.fn(),
  deleteLike: jest.fn(),
  deletePostById: jest.fn(),
  deletePostRelations: jest.fn(),
  findCommentForFeed: jest.fn(),
  findFeedPosts: jest.fn(),
  findLikedPostIds: jest.fn(),
  findPostComments: jest.fn(),
  findPostForFeed: jest.fn(),
  findPostOwner: jest.fn(),
  incrementPostCounter: jest.fn(),
}));

const createPostRecordMock = jest.mocked(createPostRecord);
const findFeedPostsMock = jest.mocked(findFeedPosts);
const findLikedPostIdsMock = jest.mocked(findLikedPostIds);

describe("post service", () => {
  beforeEach(() => jest.resetAllMocks());

  it("rejects a post without text or uploaded media", async () => {
    await expect(createPost("507f1f77bcf86cd799439011", { content: "" }, [])).rejects.toMatchObject({
      statusCode: 400,
      code: "POST_CONTENT_REQUIRED",
    });
    expect(createPostRecordMock).not.toHaveBeenCalled();
  });

  it("returns a cursor page with per-viewer like state", async () => {
    const first = {
      _id: { toString: () => "507f1f77bcf86cd799439001" },
      author: { _id: { toString: () => "507f1f77bcf86cd799439011" }, name: "Ada Lovelace", username: "ada_lovelace" },
      content: "Hello DevHub",
      mediaUrls: [], likesCount: 1, commentsCount: 2,
      createdAt: new Date("2026-08-01T00:00:00.000Z"), updatedAt: new Date("2026-08-01T00:00:00.000Z"),
    };
    const second = { ...first, _id: { toString: () => "507f1f77bcf86cd799439002" }, createdAt: new Date("2026-07-31T00:00:00.000Z") };
    findFeedPostsMock.mockResolvedValue([first, second]);
    findLikedPostIdsMock.mockResolvedValue(new Set(["507f1f77bcf86cd799439001"]));

    const page = await getFeed({ limit: 1 }, "507f1f77bcf86cd799439011");

    expect(page.items).toEqual([expect.objectContaining({ id: "507f1f77bcf86cd799439001", isLiked: true })]);
    expect(page.pageInfo.hasNextPage).toBe(true);
    expect(page.pageInfo.endCursor).toBeTruthy();
    expect(findLikedPostIdsMock).toHaveBeenCalledWith(["507f1f77bcf86cd799439001"], "507f1f77bcf86cd799439011");
  });
});
