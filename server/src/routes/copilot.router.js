import express from "express";
import { chat } from "../controllers/copilot.controller.js";

const router = express.Router();

router.post("/chat", chat);

export default router;
