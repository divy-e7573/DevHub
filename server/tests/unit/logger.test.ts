jest.mock("../../src/config/config", () => ({
  config: {
    environment: "test",
    isDevelopment: false,
    logging: { level: "silent" },
  },
}));

import { createLogger } from "../../src/utils/logger";

function createLogDestination(entries: string[]): {
  write: (message: string) => void;
} {
  return {
    write(message: string): void {
      entries.push(message);
    },
  };
}

describe("structured logger", () => {
  it("emits redacted JSON logs for production", () => {
    const entries: string[] = [];
    const logger = createLogger(
      {
        environment: "production",
        isDevelopment: false,
        level: "info",
      },
      createLogDestination(entries),
    );

    logger.info(
      {
        password: "private-password",
        nested: { token: "private-token" },
      },
      "User login attempted",
    );

    expect(entries).toHaveLength(1);
    expect(JSON.parse(entries[0])).toMatchObject({
      service: "devhub-api",
      environment: "production",
      level: 30,
      password: "[REDACTED]",
      nested: { token: "[REDACTED]" },
      msg: "User login attempted",
    });
  });

  it("uses readable level labels in development", () => {
    const entries: string[] = [];
    const logger = createLogger(
      {
        environment: "development",
        isDevelopment: true,
        level: "debug",
      },
      createLogDestination(entries),
    );

    logger.debug("Local diagnostic message");

    expect(JSON.parse(entries[0])).toMatchObject({
      environment: "development",
      level: "debug",
      msg: "Local diagnostic message",
    });
  });

  it("removes query strings and headers from serialized requests", () => {
    const entries: string[] = [];
    const logger = createLogger(
      {
        environment: "production",
        isDevelopment: false,
        level: "info",
      },
      createLogDestination(entries),
    );
    const request = {
      method: "GET",
      url: "/api/users?token=private-token",
      socket: { remoteAddress: "127.0.0.1" },
      headers: { authorization: "Bearer private-token" },
    } as unknown as import("node:http").IncomingMessage;

    logger.info({ req: request }, "Request completed");

    expect(JSON.parse(entries[0])).toMatchObject({
      req: {
        method: "GET",
        path: "/api/users",
        remoteAddress: "127.0.0.1",
      },
    });
    expect(entries[0]).not.toContain("private-token");
  });
});
