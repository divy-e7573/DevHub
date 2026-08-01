import express, { type Express } from "express";
import request from "supertest";
import { getFeed } from "../../src/services/post.service";
import { search } from "../../src/services/search.service";

jest.mock("../../src/services/post.service", () => ({
  getFeed: jest.fn(),
}));
jest.mock("../../src/services/search.service", () => ({ search: jest.fn() }));

import { apiRouter } from "../../src/routes";

const getFeedMock = jest.mocked(getFeed);
const searchMock = jest.mocked(search);

function createRoutingApp(): Express {
  const app = express();

  app.use("/api", apiRouter);

  return app;
}

describe("versioned route composition", () => {
  beforeEach(() => jest.resetAllMocks());

  it.each(["/api/v1/auth", "/api/v1/users"])(
    "reserves %s without registering an endpoint",
    async (path) => {
      const app = createRoutingApp();

      const response = await request(app).get(path);

      expect(response.status).toBe(404);
    },
  );

  it("registers the public feed endpoint", async () => {
    getFeedMock.mockResolvedValue({
      items: [],
      pageInfo: { endCursor: null, hasNextPage: false },
    });

    const response = await request(createRoutingApp()).get("/api/v1/posts");

    expect(response.status).toBe(200);
    expect(getFeedMock).toHaveBeenCalledWith({ limit: 20 }, undefined);
  });

  it("registers the public search endpoint", async () => {
    searchMock.mockResolvedValue({ type: "users", results: [] });
    const response = await request(createRoutingApp()).get("/api/v1/search?q=ada&type=users");
    expect(response.status).toBe(200);
    expect(searchMock).toHaveBeenCalledWith({ q: "ada", type: "users", limit: 20 }, undefined);
  });
});
