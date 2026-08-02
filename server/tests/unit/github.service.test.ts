import { fetchGitHubSnapshot } from "../../src/services/github.service";

describe("GitHub sync service", () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it("maps a missing GitHub user to a safe 404 error", async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 404, ok: false }) as unknown as typeof fetch;
    await expect(fetchGitHubSnapshot("missing-account")).rejects.toMatchObject({
      statusCode: 404,
      code: "GITHUB_USER_NOT_FOUND",
    });
  });
});
