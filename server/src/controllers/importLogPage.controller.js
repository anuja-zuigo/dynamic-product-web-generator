import importLogTemplate from "../templates/importLogList.template.js";

export const getImportLogPage = (req, res) => {
  // Not used directly; we serve logs via API
  res.setHeader("Content-Type", "application/json");
  return res.send(JSON.stringify({ message: "Import logs API" }));
};
