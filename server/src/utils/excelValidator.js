import { REQUIRED_COLUMNS } from "../constants/excel.constants.js";

export const validateExcelColumns = (excelData) => {
  if (!excelData || excelData.length === 0) {
    return {
      isValid: false,
      errors: ["Excel file is empty."],
    };
  }

  const uploadedColumns = Object.keys(excelData[0]);

  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !uploadedColumns.includes(column)
  );

  if (missingColumns.length > 0) {
    return {
      isValid: false,
      errors: missingColumns.map(
        (column) => `Missing required column: ${column}`
      ),
    };
  }

  return {
    isValid: true,
    errors: [],
  };
};