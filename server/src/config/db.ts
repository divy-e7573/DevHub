// Database connection lifecycle.
//
// Why this exists: connection setup (and eventual retry / event logging) is a
// config concern, not a runtime concern. Isolating it keeps `server.ts` small
// and gives us one obvious place to add connection-pool tuning or
// reconnection logic later.

import mongoose from "mongoose";
import { config } from "./config";
import { logger } from "../utils/logger";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.database.uri);
    logger.info("Connected to MongoDB");
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed");
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
