import { Router } from "express";
import { changeFollow, listFollowers, listFollowing } from "../../../controllers/follow.controller";
import { authenticate } from "../../../middleware/auth.middleware";

/**
 * User route namespace. Endpoint handlers will be registered here when the
 * user feature is implemented.
 */
export const usersRouter = Router();

usersRouter.post("/:id/follow", authenticate, changeFollow(true));
usersRouter.delete("/:id/follow", authenticate, changeFollow(false));
usersRouter.get("/:id/followers", listFollowers);
usersRouter.get("/:id/following", listFollowing);
