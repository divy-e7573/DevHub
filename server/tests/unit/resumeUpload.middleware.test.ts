import express from "express";
import request from "supertest";
import { errorHandler } from "../../src/middleware/errorHandler";
import { resumeUpload } from "../../src/middleware/resumeUpload.middleware";

describe("resume upload middleware", () => {
  it("rejects non-PDF resume uploads", async () => {
    const app = express();
    app.post("/resume", resumeUpload.single("resume"), (_req, res) => res.sendStatus(204));
    app.use(errorHandler);
    const response = await request(app)
      .post("/resume")
      .attach("resume", Buffer.from("not a PDF"), { filename: "resume.txt", contentType: "text/plain" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_RESUME_TYPE");
  });
});
