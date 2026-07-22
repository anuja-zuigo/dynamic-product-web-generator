import importProductsTemplate from "../templates/importProducts.template.js";

export const getImportPage = (req, res) => {
  res.setHeader("Content-Type", "text/html");
  return res.send(importProductsTemplate());
};
