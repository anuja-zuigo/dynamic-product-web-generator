import express from "express";
import { getLandingPage, getLoginPage, getRegisterPage, getDashboardPage } from "../controllers/dashboard.controller.js";
import { getImportPage } from "../controllers/importPage.controller.js";

const router = express.Router();

// Main site routes
router.get("/", getLandingPage);
router.get("/login", getLoginPage);
router.get("/register", getRegisterPage);
router.get("/dashboard", getDashboardPage);

// Import Products page (Excel + Images workflow)
router.get("/import", getImportPage);

export default router;
