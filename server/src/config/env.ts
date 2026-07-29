// Centralised, validated environment configuration.
//
// Why this exists: code should never read `process.env` scattered across the
// codebase. All env access funnels through this single module so there is one
// place to validate, type, and default configuration values.

import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 5000),
  MONGODB_URI: process.env.MONGODB_URI ?? "mongodb://localhost:27017/devhub",
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:3000",
} as const;

export type Env = typeof env;
