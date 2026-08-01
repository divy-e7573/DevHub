import { z } from "zod";
import type { SignOptions } from "jsonwebtoken";

type JwtExpiresIn = NonNullable<SignOptions["expiresIn"]>;

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

const jwtExpiresInSchema = requiredString("JWT_EXPIRES_IN")
  .regex(
    /^[1-9]\d*(?:ms|s|m|h|d|w|y)$/,
    "JWT_EXPIRES_IN must be a positive duration such as 15m or 7d.",
  )
  .transform((value): JwtExpiresIn => value as JwtExpiresIn);

const cookieSecureSchema = z
  .enum(["true", "false"], {
    required_error: "COOKIE_SECURE is required.",
    invalid_type_error: "COOKIE_SECURE must be true or false.",
  })
  .transform((value) => value === "true");

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

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
  JWT_SECRET: requiredString("JWT_SECRET").min(
    32,
    "JWT_SECRET must be at least 32 characters long.",
  ),
  JWT_EXPIRES_IN: jwtExpiresInSchema,
  BCRYPT_SALT_ROUNDS: z.coerce
    .number({ invalid_type_error: "BCRYPT_SALT_ROUNDS must be a number." })
    .int("BCRYPT_SALT_ROUNDS must be an integer.")
    .min(10, "BCRYPT_SALT_ROUNDS must be at least 10.")
    .max(15, "BCRYPT_SALT_ROUNDS must not exceed 15."),
  AUTH_COOKIE_NAME: requiredString("AUTH_COOKIE_NAME"),
  COOKIE_DOMAIN: optionalString,
  COOKIE_SECURE: cookieSecureSchema,
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"], {
    required_error: "COOKIE_SAME_SITE is required.",
  }),
  COOKIE_MAX_AGE_MS: z.coerce
    .number({ invalid_type_error: "COOKIE_MAX_AGE_MS must be a number." })
    .int("COOKIE_MAX_AGE_MS must be an integer.")
    .positive("COOKIE_MAX_AGE_MS must be greater than zero."),
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
  readonly auth: Readonly<{
    jwt: Readonly<{
      secret: string;
      expiresIn: JwtExpiresIn;
    }>;
    password: Readonly<{
      saltRounds: number;
    }>;
    cookie: Readonly<{
      name: string;
      domain?: string;
      secure: boolean;
      sameSite: "lax" | "strict" | "none";
      maxAgeMs: number;
    }>;
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

  if (!environment.COOKIE_SECURE) {
    throw new Error(
      "Invalid environment configuration: COOKIE_SECURE must be true in production.",
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
    auth: Object.freeze({
      jwt: Object.freeze({
        secret: environment.JWT_SECRET,
        expiresIn: environment.JWT_EXPIRES_IN,
      }),
      password: Object.freeze({
        saltRounds: environment.BCRYPT_SALT_ROUNDS,
      }),
      cookie: Object.freeze({
        name: environment.AUTH_COOKIE_NAME,
        domain: environment.COOKIE_DOMAIN,
        secure: environment.COOKIE_SECURE,
        sameSite: environment.COOKIE_SAME_SITE,
        maxAgeMs: environment.COOKIE_MAX_AGE_MS,
      }),
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

  if (
    parsedEnvironment.data.COOKIE_SAME_SITE === "none" &&
    !parsedEnvironment.data.COOKIE_SECURE
  ) {
    throw new Error(
      "Invalid environment configuration: COOKIE_SAME_SITE none requires COOKIE_SECURE to be true.",
    );
  }

  validateProductionConfiguration(parsedEnvironment.data);

  return freezeConfig(parsedEnvironment.data);
}
