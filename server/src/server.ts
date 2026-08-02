import { createServer, type Server } from "node:http";
import app from "./app";
import { config } from "./config/config";
import { logger } from "./utils/logger";
import { initializeSocketServer } from "./sockets/socket.server";

function closeServer(server: Server): void {
  server.close((error) => {
    if (error) {
      logger.error({ err: error }, "Failed to close HTTP server cleanly");
      process.exit(1);
    }

    process.exit(0);
  });
}

async function start(): Promise<void> {
  const server = createServer(app);
  initializeSocketServer(server);
  server.listen(config.server.port, config.server.host, () => {
    logger.info(
      `DevHub API listening on ${config.server.host}:${config.server.port}`,
    );
  });

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received - shutting down gracefully`);
    closeServer(server);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((error: unknown) => {
  logger.fatal({ err: error }, "Failed to start server");
  process.exit(1);
});
