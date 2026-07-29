import { randomUUID } from "node:crypto";
import pinoHttp from "pino-http";
import { logger } from "../utils/logger";

function getRequestId(header: string | string[] | undefined): string {
  if (typeof header === "string" && header.trim().length > 0) {
    return header;
  }

  return randomUUID();
}

/**
 * Emits one structured record for every completed request. Request IDs are
 * accepted from trusted clients when present and otherwise generated locally.
 */
export const requestLogger = pinoHttp({
  logger,
  customAttributeKeys: {
    reqId: "requestId",
  },
  genReqId: (req, res) => {
    const requestId = getRequestId(req.headers["x-request-id"]);
    res.setHeader("x-request-id", requestId);
    return requestId;
  },
  customLogLevel: (_req, res, error) => {
    if (error !== undefined || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  },
  customSuccessMessage: (_req, res) =>
    `Request completed with status ${res.statusCode}`,
  customErrorMessage: (_req, res) =>
    `Request failed with status ${res.statusCode}`,
});
