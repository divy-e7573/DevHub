import { Router } from "express";
import {
  changeLike,
  create,
  createComment,
  list,
  listComments,
  remove,
} from "../../../controllers/post.controller";
import { authenticate, optionallyAuthenticate } from "../../../middleware/auth.middleware";
import { postImageUpload } from "../../../middleware/postUpload.middleware";

/**
 * Post route namespace. Endpoint handlers will be registered here when the
 * post feature is implemented.
 */
export const postsRouter = Router();

postsRouter.post("/", authenticate, postImageUpload.array("images", 4), create);
postsRouter.get("/", optionallyAuthenticate, list);
postsRouter.delete("/:id", authenticate, remove);
postsRouter.post("/:id/like", authenticate, changeLike(true));
postsRouter.delete("/:id/like", authenticate, changeLike(false));
postsRouter.post("/:id/comments", authenticate, createComment);
postsRouter.get("/:id/comments", listComments);
