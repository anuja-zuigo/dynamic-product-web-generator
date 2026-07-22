import express from "express";

import {
  createProduct,
  getAllProducts,
  getDashboardStats,
  getProductById,
  updateProduct,
  deleteProduct,
  bulkUpdateSpecifications,
  convertCurrencyAmount,
  bulkDeleteProducts,
  bulkStatusChange,
} from "../controllers/product.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

import { createProductValidator } from "../validators/product.validator.js";
import {
  bulkUpdateSpecificationsValidator,
  bulkDeleteProductsValidator,
  bulkStatusChangeValidator,
} from "../validators/product.validator.js";

const router = express.Router();

router.get("/currency/convert", convertCurrencyAmount);

router.get("/stats", authMiddleware, getDashboardStats);

router.post(
  "/",
  authMiddleware,
  createProductValidator,
  createProduct
);

router.get(
  "/",
  authMiddleware,
  getAllProducts
);

// Bulk edit specs route (MUST be placed before /:id matching)
router.patch(
  "/bulk/specifications",
  authMiddleware,
  bulkUpdateSpecificationsValidator,
  bulkUpdateSpecifications
);

// Bulk delete route
router.delete(
  "/bulk",
  authMiddleware,
  bulkDeleteProductsValidator,
  bulkDeleteProducts
);

// Bulk status change route
router.patch(
  "/bulk/status",
  authMiddleware,
  bulkStatusChangeValidator,
  bulkStatusChange
);

router.get(
  "/:id",
  authMiddleware,
  getProductById
);

router.put(
  "/:id",
  authMiddleware,
  createProductValidator,
  updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  deleteProduct
);

export default router;