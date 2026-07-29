import "dotenv/config";
import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "staging", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(5000),
  CLIENT_URL: z.string().url().default("http://localhost:3000"),
  TRUST_PROXY: z
    .string()
    .optional()
    .transform((value, context): boolean | number => {
      if (value === undefined || value === "" || value === "false") {
        return false;
      }

      const proxyHops = Number(value);
      if (!Number.isInteger(proxyHops) || proxyHops < 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "TRUST_PROXY must be false or a non-negative integer.",
        });
        return z.NEVER;
      }

      return proxyHops;
    }),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/devhub"),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const issues = parsedEnvironment.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = parsedEnvironment.data;

export type Env = typeof env;
