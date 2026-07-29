import morgan from "morgan";
import { env } from "../config/env";
import { logger } from "../utils/logger";

/** Routes request logs through the application logger. */
export const requestLogger = morgan(
  env.NODE_ENV === "production" ? "combined" : "dev",
  {
    stream: {
      write(message: string): void {
        logger.info(message.trim());
      },
    },
  }
);
