import { Router } from "express";
import { searchAll } from "../../../controllers/search.controller";
import { optionallyAuthenticate } from "../../../middleware/auth.middleware";

export const searchRouter = Router();
searchRouter.get("/", optionallyAuthenticate, searchAll);
