import { Router } from "express";

import {
  signup,
  login,
} from "../controllers/auth.controller.js";

import {
  signupValidator,
  loginValidator,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/signup", signupValidator, signup);

router.post("/login", loginValidator, login);

export default router;