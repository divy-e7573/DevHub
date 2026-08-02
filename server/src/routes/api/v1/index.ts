import { Router } from "express";
import { authRouter } from "./auth.routes";
import { postsRouter } from "./posts.routes";
import { profilesRouter } from "./profiles.routes";
import { searchRouter } from "./search.routes";
import { usersRouter } from "./users.routes";
import { conversationsRouter } from "./conversations.routes";
import { notificationsRouter } from "./notifications.routes";

/**
 * Version 1 API composition. Feature routers own their endpoint definitions;
 * this module only assigns their versioned URL namespaces.
 */
export const apiV1Router = Router();

apiV1Router.use("/auth", authRouter);
apiV1Router.use("/users", usersRouter);
apiV1Router.use("/posts", postsRouter);
apiV1Router.use("/profiles", profilesRouter);
apiV1Router.use("/search", searchRouter);
apiV1Router.use("/conversations", conversationsRouter);
apiV1Router.use("/notifications", notificationsRouter);
