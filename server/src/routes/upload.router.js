import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

import { uploadProductImages } from "../controllers/upload.controller.js";

const router = express.Router();

router.post(
  "/images",
  authMiddleware,
  upload.array("images", 100),
  uploadProductImages
);

export default router;