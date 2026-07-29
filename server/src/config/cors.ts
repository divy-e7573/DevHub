import type { CorsOptions } from "cors";
import { config } from "./config";

export const corsOptions: CorsOptions = {
  origin: config.client.url,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
};
