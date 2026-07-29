import { gzip } from "node:zlib";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

const MINIMUM_COMPRESSIBLE_BYTES = 1024;
const compressibleContentType =
  /^(?:text\/|application\/(?:json|javascript|xml|x-javascript|xhtml\+xml)|image\/svg\+xml)/i;

function acceptsGzip(req: Request): boolean {
  const acceptedEncodings = req.headers["accept-encoding"];

  if (typeof acceptedEncodings !== "string") {
    return false;
  }

  return acceptedEncodings.split(",").some((entry) => {
    const [encoding, ...parameters] = entry.trim().toLowerCase().split(";");
    if (encoding !== "gzip" && encoding !== "*") {
      return false;
    }

    const qualityParameter = parameters.find((parameter) =>
      parameter.trim().startsWith("q="),
    );
    if (qualityParameter === undefined) {
      return true;
    }

    const quality = Number(qualityParameter.trim().slice(2));
    return Number.isFinite(quality) && quality > 0;
  });
}

function shouldCompress(
  req: Request,
  res: Response,
  body: string | Buffer,
): boolean {
  const contentType = res.getHeader("content-type");
  const cacheControl = res.getHeader("cache-control");

  if (
    req.method === "HEAD" ||
    res.statusCode === 204 ||
    res.statusCode === 304 ||
    res.hasHeader("content-encoding") ||
    typeof contentType !== "string" ||
    !compressibleContentType.test(contentType) ||
    (typeof cacheControl === "string" && cacheControl.includes("no-transform"))
  ) {
    return false;
  }

  return (
    acceptsGzip(req) && Buffer.byteLength(body) >= MINIMUM_COMPRESSIBLE_BYTES
  );
}

/**
 * Compresses eligible finite responses with Node's native gzip implementation.
 * Streamed responses are left untouched for route-specific stream handling.
 */
export function responseCompression(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const originalSend = res.send.bind(res);

  res.send = ((body: unknown): Response => {
    if (
      (typeof body !== "string" && !Buffer.isBuffer(body)) ||
      !shouldCompress(req, res, body)
    ) {
      return originalSend(body);
    }

    gzip(body, (error, compressedBody) => {
      if (error) {
        logger.warn({ err: error }, "Response compression failed");
        originalSend(body);
        return;
      }

      res.setHeader("Content-Encoding", "gzip");
      res.vary("Accept-Encoding");
      res.removeHeader("Content-Length");
      originalSend(compressedBody);
    });

    return res;
  }) as typeof res.send;

  next();
}
