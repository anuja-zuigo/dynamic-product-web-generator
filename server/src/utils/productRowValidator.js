export const validateProductRows = (rows) => {
  const validationErrors = [];

  rows.forEach((row, index) => {
    const rowErrors = [];
    const excelRowNumber = index + 2; // +2 because row 1 is the header

    if (!row["Product Name"]?.toString().trim()) {
      rowErrors.push("Product Name is required.");
    }

    if (!row["Description"]?.toString().trim()) {
      rowErrors.push("Description is required.");
    }

    if (!row["Brand"]?.toString().trim()) {
      rowErrors.push("Brand is required.");
    }

    if (!row["Category"]?.toString().trim()) {
      rowErrors.push("Category is required.");
    }

    const price = Number(row["Price"]);

    if (isNaN(price) || price <= 0) {
      rowErrors.push("Price must be greater than 0.");
    }

    const stock = Number(row["Stock"]);

    if (isNaN(stock) || stock < 0) {
      rowErrors.push("Stock must be 0 or greater.");
    }

    if (!row["Image Name"]?.toString().trim()) {
      rowErrors.push("Image Name is required.");
    }

    if (rowErrors.length > 0) {
      validationErrors.push({
        row: excelRowNumber,
        errors: rowErrors,
      });
    }
  });

  return validationErrors;
};