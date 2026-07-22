import xlsx from "xlsx";

export const parseExcelFile = (filePath) => {
  const workbook = xlsx.readFile(filePath);

  const firstSheetName = workbook.SheetNames[0];

  const worksheet = workbook.Sheets[firstSheetName];

  const data = xlsx.utils.sheet_to_json(worksheet, {
    defval: "",
  });

  return data;
};