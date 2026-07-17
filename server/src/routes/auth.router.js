import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  signup,
  login,
  getProfile,
  logout,
} from "../controllers/auth.controller.js";

import {
  signupValidator,
  loginValidator,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/signup", signupValidator, signup);

router.post("/login", loginValidator, login);

router.get("/profile", authMiddleware, getProfile);

router.post("/logout", authMiddleware, logout);

export default router;