import path from "path";
import { parseExcelFile } from "../utils/excelParser.js";
import { validateExcelColumns } from "../utils/excelValidator.js";
import { validateProductRows } from "../utils/productRowValidator.js";
import { mapImagesToProducts } from "./imageMapping.service.js";
import Product from "../models/Product.js";
import ImportLog from "../models/ImportLog.js";

export const importExcelService = async (ownerId, filePath) => {
  // Parse Excel
  console.log(`[IMPORT LOG] Parsing Excel...`);
  const excelData = parseExcelFile(filePath);
  console.log(`[IMPORT LOG] Rows Found : ${excelData.length}`);

  // Validate required columns
  const columnValidation = validateExcelColumns(excelData);

  if (!columnValidation.isValid) {
    await ImportLog.create({
      ownerId,
      fileName: path.basename(filePath),
      insertedCount: 0,
      status: "FAILED",
    });

    return {
      success: false,
      type: "COLUMN_VALIDATION",
      errors: columnValidation.errors,
    };
  }

  // Validate each row
  const rowValidation = validateProductRows(excelData);

  if (rowValidation.length > 0) {
    await ImportLog.create({
      ownerId,
      fileName: path.basename(filePath),
      insertedCount: 0,
      status: "FAILED",
    });

    return {
      success: false,
      type: "ROW_VALIDATION",
      errors: rowValidation,
    };
  }

  // Match images with UploadedImage collection (or default image fallback)
  const imageMapping = await mapImagesToProducts(ownerId, excelData);

  if (imageMapping.validationErrors.length > 0) {
    await ImportLog.create({
      ownerId,
      fileName: path.basename(filePath),
      insertedCount: 0,
      status: "FAILED",
    });

    return {
      success: false,
      type: "IMAGE_VALIDATION",
      errors: imageMapping.validationErrors,
    };
  }

  // Insert all products
  const createdProducts = await Product.insertMany(imageMapping.mappedProducts);

  // Create ImportLog record
  await ImportLog.create({
    ownerId,
    fileName: path.basename(filePath),
    insertedCount: createdProducts.length,
    status: "SUCCESS",
  });

  return {
    success: true,
    data: createdProducts,
    insertedCount: createdProducts.length,
    report: imageMapping.report
  };
};