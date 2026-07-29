import { z } from "zod";

const runtimeEnvironmentSchema = z.enum([
  "development",
  "test",
  "staging",
  "production",
]);

const requiredString = (variableName: string) =>
  z
    .string({ required_error: `${variableName} is required.` })
    .trim()
    .min(1, `${variableName} is required.`);

const trustProxySchema = requiredString("TRUST_PROXY").transform(
  (value, context): boolean | number => {
    if (value === "false") {
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
  },
);

const mongoDbUriSchema = requiredString("MONGODB_URI")
  .url("MONGODB_URI must be a valid MongoDB connection URL.")
  .refine((value) => {
    try {
      const protocol = new URL(value).protocol;
      return protocol === "mongodb:" || protocol === "mongodb+srv:";
    } catch {
      return false;
    }
  }, "MONGODB_URI must use the mongodb:// or mongodb+srv:// scheme.");

const environmentSchema = z.object({
  NODE_ENV: runtimeEnvironmentSchema,
  HOST: requiredString("HOST"),
  PORT: z.coerce
    .number({ invalid_type_error: "PORT must be a number." })
    .int("PORT must be an integer.")
    .min(1, "PORT must be between 1 and 65535.")
    .max(65_535, "PORT must be between 1 and 65535."),
  CLIENT_URL: requiredString("CLIENT_URL").url(
    "CLIENT_URL must be a valid URL.",
  ),
  TRUST_PROXY: trustProxySchema,
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number({ invalid_type_error: "RATE_LIMIT_WINDOW_MS must be a number." })
    .int("RATE_LIMIT_WINDOW_MS must be an integer.")
    .positive("RATE_LIMIT_WINDOW_MS must be greater than zero."),
  RATE_LIMIT_MAX_REQUESTS: z.coerce
    .number({ invalid_type_error: "RATE_LIMIT_MAX_REQUESTS must be a number." })
    .int("RATE_LIMIT_MAX_REQUESTS must be an integer.")
    .positive("RATE_LIMIT_MAX_REQUESTS must be greater than zero."),
  MONGODB_URI: mongoDbUriSchema,
});

type ParsedEnvironment = z.infer<typeof environmentSchema>;

export interface Config {
  readonly environment: ParsedEnvironment["NODE_ENV"];
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly server: Readonly<{
    host: string;
    port: number;
    trustProxy: boolean | number;
  }>;
  readonly client: Readonly<{
    url: string;
  }>;
  readonly database: Readonly<{
    uri: string;
  }>;
  readonly logging: Readonly<{
    level: ParsedEnvironment["LOG_LEVEL"];
  }>;
  readonly rateLimit: Readonly<{
    windowMs: number;
    maxRequests: number;
  }>;
}

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
}

function validateProductionConfiguration(environment: ParsedEnvironment): void {
  if (environment.NODE_ENV !== "production") {
    return;
  }

  if (new URL(environment.CLIENT_URL).protocol !== "https:") {
    throw new Error(
      "Invalid environment configuration: CLIENT_URL must use HTTPS in production.",
    );
  }

  if (
    typeof environment.TRUST_PROXY !== "number" ||
    environment.TRUST_PROXY < 1
  ) {
    throw new Error(
      "Invalid environment configuration: TRUST_PROXY must be a positive integer in production.",
    );
  }
}

function freezeConfig(environment: ParsedEnvironment): Config {
  const isDevelopment = environment.NODE_ENV === "development";
  const isProduction = environment.NODE_ENV === "production";

  return Object.freeze({
    environment: environment.NODE_ENV,
    isDevelopment,
    isProduction,
    server: Object.freeze({
      host: environment.HOST,
      port: environment.PORT,
      trustProxy: environment.TRUST_PROXY,
    }),
    client: Object.freeze({ url: environment.CLIENT_URL }),
    database: Object.freeze({ uri: environment.MONGODB_URI }),
    logging: Object.freeze({ level: environment.LOG_LEVEL }),
    rateLimit: Object.freeze({
      windowMs: environment.RATE_LIMIT_WINDOW_MS,
      maxRequests: environment.RATE_LIMIT_MAX_REQUESTS,
    }),
  });
}

/**
 * Validates raw environment values and converts them into the application's
 * immutable runtime configuration. Kept pure so configuration rules are
 * directly testable without mutating process.env.
 */
export function createConfig(environmentVariables: NodeJS.ProcessEnv): Config {
  const parsedEnvironment = environmentSchema.safeParse(environmentVariables);

  if (!parsedEnvironment.success) {
    throw new Error(
      `Invalid environment configuration: ${formatIssues(parsedEnvironment.error)}`,
    );
  }

  validateProductionConfiguration(parsedEnvironment.data);

  return freezeConfig(parsedEnvironment.data);
}
