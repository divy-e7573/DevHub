import morgan from "morgan";
import { config } from "../config/config";
import { logger } from "../utils/logger";

/** Routes request logs through the application logger. */
export const requestLogger = morgan(config.isProduction ? "combined" : "dev", {
  stream: {
    write(message: string): void {
      logger.info(message.trim());
    },
  },
});
