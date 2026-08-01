import type { CookieOptions } from "express";
import { config } from "./config";

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.auth.cookie.secure,
  sameSite: config.auth.cookie.sameSite,
  maxAge: config.auth.cookie.maxAgeMs,
  domain: config.auth.cookie.domain,
  path: "/",
  priority: "high",
};
