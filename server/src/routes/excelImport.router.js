import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import excelUpload from "../middleware/excelUpload.middleware.js";

import { importExcel } from "../controllers/excelImport.controller.js";

const router = express.Router();

const processUploadedExcel = (req, res, next) => {
  if (req.files) {
    req.file = req.files.file?.[0] || req.files.excel?.[0];
  }
  next();
};

router.post(
  "/import",
  authMiddleware,
  excelUpload.fields([{ name: "file", maxCount: 1 }, { name: "excel", maxCount: 1 }]),
  processUploadedExcel,
  importExcel
);

export default router;