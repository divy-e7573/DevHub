import { Router } from "express";
import { authRouter } from "./auth.routes";
import { postsRouter } from "./posts.routes";
import { usersRouter } from "./users.routes";

/**
 * Version 1 API composition. Feature routers own their endpoint definitions;
 * this module only assigns their versioned URL namespaces.
 */
export const apiV1Router = Router();

apiV1Router.use("/auth", authRouter);
apiV1Router.use("/users", usersRouter);
apiV1Router.use("/posts", postsRouter);
