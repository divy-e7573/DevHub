import "dotenv/config";
import { createConfig } from "./configuration";

/**
 * The application's single source of runtime configuration. Import this
 * object instead of reading process.env elsewhere in the server.
 */
export const config = createConfig(process.env);

export type { Config } from "./configuration";
