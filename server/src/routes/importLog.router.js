import express from "express";
import { listImportLogs } from "../controllers/importLog.controller.js";

const router = express.Router();

// GET /api/v1/import/logs - returns import history
router.get("/logs", listImportLogs);

export default router;
