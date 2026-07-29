// Minimal logger.
//
// Why this exists: logging goes through one module so we can later swap this
// thin wrapper for a structured logger (e.g. pino/winston) without touching
// call sites. For now it is intentionally a console-backed stub.

export const logger = {
  info: (message: string, meta?: unknown) =>
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${message}`, meta ?? ""),
  warn: (message: string, meta?: unknown) =>
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, meta ?? ""),
  error: (message: string, meta?: unknown) =>
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, meta ?? ""),
};
