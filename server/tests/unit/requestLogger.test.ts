import express, { type Express } from "express";
import pino from "pino";
import request from "supertest";

jest.mock("../../src/utils/logger", () => ({
  logger: pino({ enabled: false }),
}));

import { requestLogger } from "../../src/middleware/requestLogger";

function createRequestLoggerApp(): Express {
  const app = express();

  app.use(requestLogger);
  app.get("/test", (_req, res) => {
    res.status(204).end();
  });

  return app;
}

describe("request logger middleware", () => {
  it("preserves a caller-supplied request ID", async () => {
    const app = createRequestLoggerApp();

    const response = await request(app)
      .get("/test")
      .set("x-request-id", "request-from-client");

    expect(response.headers["x-request-id"]).toBe("request-from-client");
  });

  it("generates a request ID when the caller does not provide one", async () => {
    const app = createRequestLoggerApp();

    const response = await request(app).get("/test");

    expect(response.headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
