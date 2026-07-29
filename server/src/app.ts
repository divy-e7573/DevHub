// Express application instance.
//
// This file wires up the framework-level plumbing ONLY:
//   - global middleware (JSON parsing, security, CORS, logging)
//   - route mounting
//   - the global error-handling middleware (registered last)
//
// It deliberately contains NO business logic, NO auth, and NO routes yet.
// Keeping `app.ts` separate from `server.ts` lets us import the app in
// tests without binding a network port.

import express, { Application, Request, Response } from "express";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

// --- Core middleware (framework concerns, not business logic) ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// TODO: security headers, CORS, request logging, rate limiting.

// --- Health check (infrastructure endpoint, intentionally minimal) ---
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "devhub-api" });
});

// --- Route mounting ---
// Feature routes will be registered here, e.g.:
//   app.use("/api/auth", authRoutes);
//   app.use("/api/posts", postRoutes);

// --- 404 + global error handler (must be last) ---
app.use(notFound);
app.use(errorHandler);

export default app;
