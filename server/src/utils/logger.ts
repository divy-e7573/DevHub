import { config } from "../config/config";

type LogLevel = "debug" | "info" | "warn" | "error";

const logPriorities: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function writeLog(level: LogLevel, message: string, meta?: unknown): void {
  if (logPriorities[level] < logPriorities[config.logging.level]) {
    return;
  }

  const prefix = `[${level.toUpperCase()}]`;

  if (level === "error") {
    // eslint-disable-next-line no-console
    console.error(prefix, message, meta ?? "");
    return;
  }

  if (level === "warn") {
    // eslint-disable-next-line no-console
    console.warn(prefix, message, meta ?? "");
    return;
  }

  // eslint-disable-next-line no-console
  console.log(prefix, message, meta ?? "");
}

export const logger = {
  debug: (message: string, meta?: unknown): void =>
    writeLog("debug", message, meta),
  info: (message: string, meta?: unknown): void =>
    writeLog("info", message, meta),
  warn: (message: string, meta?: unknown): void =>
    writeLog("warn", message, meta),
  error: (message: string, meta?: unknown): void =>
    writeLog("error", message, meta),
};
