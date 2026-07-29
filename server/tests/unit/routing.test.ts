import express, { type Express } from "express";
import request from "supertest";
import { apiRouter } from "../../src/routes";

function createRoutingApp(): Express {
  const app = express();

  app.use("/api", apiRouter);

  return app;
}

describe("versioned route composition", () => {
  it.each(["/api/v1/auth", "/api/v1/users", "/api/v1/posts"])(
    "reserves %s without registering an endpoint",
    async (path) => {
      const app = createRoutingApp();

      const response = await request(app).get(path);

      expect(response.status).toBe(404);
    },
  );
});
