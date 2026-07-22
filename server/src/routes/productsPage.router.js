import express from "express";
import { getProductsListingPage, exportShopZip } from "../controllers/productsPage.controller.js";

const router = express.Router();

router.get("/", getProductsListingPage);
router.get("/export/zip", exportShopZip);

export default router;
