import cors from "cors";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { config } from "./config/config";
import { corsOptions } from "./config/cors";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { requestLogger } from "./middleware/requestLogger";
import { responseCompression } from "./middleware/responseCompression";
import { securityHeaders } from "./middleware/securityHeaders";
import { apiRouter } from "./routes";
import { successResponse } from "./utils/response";

const app: Application = express();

app.disable("x-powered-by");
app.set("trust proxy", config.server.trustProxy);

app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(requestLogger);
app.use(apiRateLimiter);
app.use(responseCompression);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Infrastructure status endpoint. No business routes are mounted yet.
app.get("/", (_req: Request, res: Response) => {
  successResponse(res, "DevHub API Running");
});

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
