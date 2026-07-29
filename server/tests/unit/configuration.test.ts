import { createConfig } from "../../src/config/configuration";

function createValidEnvironment(
  overrides: NodeJS.ProcessEnv = {},
): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "development",
    HOST: "127.0.0.1",
    PORT: "5000",
    CLIENT_URL: "http://localhost:3000",
    TRUST_PROXY: "false",
    LOG_LEVEL: "info",
    RATE_LIMIT_WINDOW_MS: "900000",
    RATE_LIMIT_MAX_REQUESTS: "100",
    MONGODB_URI: "mongodb://localhost:27017/devhub",
    ...overrides,
  };
}

describe("runtime configuration", () => {
  it("creates an immutable, typed configuration object", () => {
    const config = createConfig(createValidEnvironment());

    expect(config).toEqual({
      environment: "development",
      isDevelopment: true,
      isProduction: false,
      server: {
        host: "127.0.0.1",
        port: 5000,
        trustProxy: false,
      },
      client: { url: "http://localhost:3000" },
      database: { uri: "mongodb://localhost:27017/devhub" },
      logging: { level: "info" },
      rateLimit: {
        windowMs: 900000,
        maxRequests: 100,
      },
    });
    expect(Object.isFrozen(config)).toBe(true);
    expect(Object.isFrozen(config.server)).toBe(true);
  });

  it("fails fast when a required environment variable is missing", () => {
    const environment = createValidEnvironment();
    delete environment.MONGODB_URI;

    expect(() => createConfig(environment)).toThrow(
      "MONGODB_URI: MONGODB_URI is required.",
    );
  });

  it("rejects invalid environment values", () => {
    expect(() =>
      createConfig(createValidEnvironment({ RATE_LIMIT_MAX_REQUESTS: "zero" })),
    ).toThrow(
      "RATE_LIMIT_MAX_REQUESTS: RATE_LIMIT_MAX_REQUESTS must be a number.",
    );
    expect(() =>
      createConfig(
        createValidEnvironment({ MONGODB_URI: "https://database.example.com" }),
      ),
    ).toThrow("MONGODB_URI must use the mongodb:// or mongodb+srv:// scheme.");
  });

  it("allows local HTTP and no proxy in development", () => {
    const config = createConfig(createValidEnvironment());

    expect(config.client.url).toBe("http://localhost:3000");
    expect(config.server.trustProxy).toBe(false);
  });

  it("requires HTTPS and explicit proxy trust in production", () => {
    const productionEnvironment = createValidEnvironment({
      NODE_ENV: "production",
      CLIENT_URL: "https://devhub.example.com",
      TRUST_PROXY: "1",
    });

    const config = createConfig(productionEnvironment);

    expect(config.isProduction).toBe(true);
    expect(config.server.trustProxy).toBe(1);
    expect(() =>
      createConfig(
        createValidEnvironment({
          NODE_ENV: "production",
          CLIENT_URL: "http://devhub.example.com",
          TRUST_PROXY: "1",
        }),
      ),
    ).toThrow("CLIENT_URL must use HTTPS in production.");
    expect(() =>
      createConfig(
        createValidEnvironment({
          NODE_ENV: "production",
          CLIENT_URL: "https://devhub.example.com",
          TRUST_PROXY: "false",
        }),
      ),
    ).toThrow("TRUST_PROXY must be a positive integer in production.");
  });
});
