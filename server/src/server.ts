// Process entry point.
//
// Responsibilities (and ONLY these):
//   - load configuration
//   - connect to MongoDB
//   - start listening on the configured port
//   - register graceful-shutdown hooks
//
// Everything the HTTP server actually *does* lives in `app.ts` and the
// layered modules it wires together.

import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { logger } from "./utils/logger";

async function start(): Promise<void> {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`DevHub API listening on http://localhost:${env.PORT}`);
  });

  // Graceful shutdown so in-flight requests finish and the DB closes cleanly.
  const shutdown = (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
