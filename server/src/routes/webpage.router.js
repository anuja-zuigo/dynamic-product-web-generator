import express from "express";
import { getProductWebPage, exportProductWebPage, exportProductPdf, submitProductReview } from "../controllers/webpage.controller.js";

const router = express.Router();

router.get("/:slug", getProductWebPage);
router.get("/:slug/export", exportProductWebPage);
router.get("/:slug/pdf", exportProductPdf);
router.post("/:slug/reviews", submitProductReview);

export default router;