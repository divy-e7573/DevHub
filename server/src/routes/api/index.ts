import { Router } from "express";
import { apiV1Router } from "./v1";

/** Routes requests to the currently supported API versions. */
export const apiRouter = Router();

apiRouter.use("/v1", apiV1Router);
