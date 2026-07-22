import UploadedImage from "../models/UploadedImage.js";
import { generateSlug } from "../utils/slug.js";

export const mapImagesToProducts = async (ownerId, excelRows) => {
  const validationErrors = [];
  const mappedProducts = [];
  
  const report = {
    productsImported: 0,
    imagesMatched: 0,
    imagesAutoMatched: 0,
    missingImages: 0,
    duplicateImageNames: 0,
    details: []
  };

  const standardKeys = ["Product Name", "Description", "Brand", "Category", "Price", "Stock", "Image Name"];

  console.log(`[IMPORT LOG] Creating intelligent image lookup...`);
  const userImages = await UploadedImage.find({ ownerId }).sort({ createdAt: -1 });
  
  const exactLookup = {};
  const normalizedLookup = {};
  
  const normalizeString = (str) => {
    if (!str) return "";
    let s = String(str).trim().toLowerCase();
    // Remove extension
    s = s.replace(/\.[a-z0-9]+$/i, "");
    // Replace separators with spaces
    s = s.replace(/[-_]+/g, " ");
    s = s.replace(/\s+/g, " ");
    return s.trim().normalize("NFC");
  };

  for (const img of userImages) {
    exactLookup[img.originalName] = img;
    const norm = normalizeString(img.originalName);
    if (!normalizedLookup[norm]) {
      normalizedLookup[norm] = [];
    }
    normalizedLookup[norm].push(img);
  }

  for (let index = 0; index < excelRows.length; index++) {
    const row = excelRows[index];
    const productName = row["Product Name"];
    console.log(`[IMPORT LOG] Processing Row ${index + 1}: ${productName}`);

    let uploadedImage = null;
    const expectedImageName = row["Image Name"];
    
    let matchStatus = "NONE";
    let matchReason = "";
    let matchDuplicates = [];

    if (expectedImageName) {
      if (exactLookup[expectedImageName]) {
        uploadedImage = exactLookup[expectedImageName];
        matchStatus = "MATCHED_EXACT";
        matchReason = "Exact match";
        report.imagesMatched++;
        console.log(`[IMPORT LOG] Match Type: Exact Match`);
      } else {
        const normExpected = normalizeString(expectedImageName);
        const possibleMatches = normalizedLookup[normExpected] || [];
        
        if (possibleMatches.length === 1) {
          uploadedImage = possibleMatches[0];
          matchStatus = "MATCHED_AUTO";
          matchReason = "Extension ignored";
          report.imagesAutoMatched++;
          console.log(`[IMPORT LOG] Match Type: Smart Extension Match`);
        } else if (possibleMatches.length > 1) {
          matchStatus = "DUPLICATE";
          matchReason = "Duplicate Images Found";
          matchDuplicates = possibleMatches.map(m => m.originalName);
          report.duplicateImageNames++;
          console.log(`[IMPORT LOG] Match Type: DUPLICATE FOUND (${matchDuplicates.join(", ")})`);
        } else {
          matchStatus = "MISSING";
          matchReason = "Placeholder Assigned";
          report.missingImages++;
          console.log(`[IMPORT LOG] Match Type: None - Placeholder Assigned`);
        }
      }
    } else {
      matchStatus = "MISSING";
      matchReason = "No expected image";
      report.missingImages++;
    }
    
    report.productsImported++;
    report.details.push({
      product: productName,
      expected: expectedImageName || "None",
      matched: uploadedImage ? uploadedImage.originalName : "None",
      status: matchStatus,
      reason: matchReason,
      duplicates: matchDuplicates
    });

    // Extract dynamic specifications from non-standard columns
    const specifications = {};
    for (const [key, value] of Object.entries(row)) {
      if (!standardKeys.includes(key) && value !== undefined && value !== null && value !== "") {
        specifications[key] = String(value);
      }
    }

    const imgPath = uploadedImage ? uploadedImage.path : "/uploads/products/default.png";
    const origName = uploadedImage ? uploadedImage.originalName : (expectedImageName || "default.png");
    const stName = uploadedImage ? uploadedImage.storedName : "default.png";

    mappedProducts.push({
      ownerId,
      name: productName,
      slug: generateSlug(productName),
      description: row["Description"] || "High-performance catalog product.",
      brand: row["Brand"] || "Generic",
      category: row["Category"] || "General",
      price: Number(row["Price"]) || 0,
      stock: Number(row["Stock"]) || 0,
      image: {
        originalName: origName,
        storedName: stName,
        path: imgPath,
      },
      status: "ACTIVE",
      specifications,
    });
  }

  return {
    validationErrors,
    mappedProducts,
    report
  };
};