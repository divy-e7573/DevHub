import { Router } from "express";
import {
  getMe,
  login,
  logout,
  register,
} from "../../../controllers/auth.controller";
import { authenticate } from "../../../middleware/auth.middleware";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticate, getMe);
