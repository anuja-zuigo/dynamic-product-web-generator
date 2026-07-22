import { importExcelService } from "../services/excelImport.service.js";

export const importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file.",
      });
    }

    console.log(`\n[IMPORT LOG] Received Excel:\n - ${req.file.originalname}\n`);

   const result = await importExcelService(
  req.user._id,
  req.file.path
);

    if (!result.success) {
  return res.status(400).json({
    success: false,
    type: result.type,
    message: "Excel validation failed.",
    errors: result.errors,
  });
}

  return res.status(201).json({
    success: true,
    message: "Excel imported successfully.",
    totalProducts: result.data.length,
    data: result.data,
    report: result.report
  });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};