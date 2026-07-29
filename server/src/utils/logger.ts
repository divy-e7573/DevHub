import type { IncomingMessage } from "node:http";
import pino, { type Logger as PinoLogger } from "pino";
import { config } from "../config/config";

export type LogContext = Record<string, unknown>;

export interface LoggerSettings {
  environment: string;
  isDevelopment: boolean;
  level: pino.LevelWithSilent;
}

const REDACTED_VALUE = "[REDACTED]";

const redactedPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "res.headers.set-cookie",
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "*.password",
  "*.token",
  "*.accessToken",
  "*.refreshToken",
];

function serializeRequest(request: IncomingMessage): Record<string, unknown> {
  const [path] = (request.url ?? "").split("?");

  return {
    method: request.method,
    path,
    remoteAddress: request.socket.remoteAddress,
  };
}

/**
 * Creates a structured logger with shared service metadata and redaction.
 * Development uses readable string levels; production retains Pino's compact
 * numeric level representation for log aggregation systems.
 */
export function createLogger(
  settings: LoggerSettings,
  destination?: pino.DestinationStream,
): PinoLogger {
  return pino(
    {
      level: settings.level,
      base: {
        service: "devhub-api",
        environment: settings.environment,
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: settings.isDevelopment
        ? {
            level: (label) => ({ level: label }),
          }
        : undefined,
      redact: {
        paths: redactedPaths,
        censor: REDACTED_VALUE,
      },
      serializers: {
        req: serializeRequest,
      },
    },
    destination,
  );
}

export const logger = createLogger({
  environment: config.environment,
  isDevelopment: config.isDevelopment,
  level: config.logging.level,
});

/** Creates a child logger that automatically includes the supplied context. */
export function createChildLogger(context: LogContext): PinoLogger {
  return logger.child(context);
}
