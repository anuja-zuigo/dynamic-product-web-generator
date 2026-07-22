import PDFDocument from "pdfkit";
import Product from "../models/Product.js";
import { convertPrice, formatCurrency } from "./currency.service.js";

export const generateProductPdfService = async (slug, targetCurrency = "INR") => {
  const product = await Product.findOne({ slug }).lean();

  if (!product) {
    throw new Error("Product not found.");
  }

  const activeCurrency = (targetCurrency || "INR").toUpperCase();
  if (activeCurrency !== "INR") {
    product.price = convertPrice(product.price, "INR", activeCurrency);
    product.currency = activeCurrency;
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // 1. Header (Logo / Shop Name)
      doc
        .fillColor("#1a1a1a")
        .fontSize(20)
        .text("DYNAMIC SHOP", 50, 45)
        .fontSize(10)
        .fillColor("#777777")
        .text("Product Specification Sheet", 50, 68, { align: "right" });

      // Draw thin header line
      doc
        .strokeColor("#e2e8f0")
        .lineWidth(1)
        .moveTo(50, 80)
        .lineTo(545, 80)
        .stroke();

      // 2. Product Name & Meta Info
      doc.y = 100;
      doc
        .fillColor("#9e9e9e")
        .fontSize(10)
        .text((product.brand || "GENERIC").toUpperCase())
        .y += 4;
      
      doc
        .fillColor("#0f172a")
        .fontSize(28)
        .text(product.name, { lineGap: 8 });

      // Formatted Price using currency service
      const formattedPrice = formatCurrency(product.price, activeCurrency);

      doc
        .fontSize(18)
        .fillColor("#0284c7")
        .text(formattedPrice, { lineGap: 12 });

      // Stock Status
      const isOutOfStock = product.stock === 0;
      const stockText = isOutOfStock 
        ? "Out of Stock" 
        : product.stock < 5 
          ? `Low Stock (${product.stock} left)` 
          : "In Stock";
      const stockColor = isOutOfStock ? "#ef4444" : product.stock < 5 ? "#f59e0b" : "#22c55e";

      doc
        .fontSize(10)
        .fillColor(stockColor)
        .text(`• ${stockText}`, { lineGap: 16 });

      doc.y += 10;

      // 3. Description Section
      doc
        .fillColor("#0f172a")
        .fontSize(14)
        .text("Description", { underline: true, lineGap: 6 });
      
      doc
        .fillColor("#334155")
        .fontSize(10)
        .text(product.description, { width: 495, align: "justify", lineGap: 4 });

      doc.y += 20;

      // 4. Core Details Table
      doc
        .fillColor("#0f172a")
        .fontSize(14)
        .text("Details", { underline: true, lineGap: 10 });

      const startTableY = doc.y;
      let currentTableY = startTableY;

      const drawRow = (label, value) => {
        doc.rect(50, currentTableY, 150, 24).fillAndStroke("#f8fafc", "#cbd5e1");
        doc.rect(200, currentTableY, 345, 24).fillAndStroke("#ffffff", "#cbd5e1");
        
        doc.fillColor("#475569").fontSize(9).text(label, 60, currentTableY + 8);
        doc.fillColor("#0f172a").fontSize(9).text(value || "N/A", 210, currentTableY + 8);
        currentTableY += 24;
      };

      drawRow("Brand", product.brand || "Generic");
      drawRow("Category", product.category);
      drawRow("Total Stock", `${product.stock} units`);
      drawRow("Availability", product.stock > 0 ? "In Stock" : "Out of Stock");

      doc.y = currentTableY + 20;

      // 5. Custom specifications (if any)
      if (product.specifications) {
        const specsEntries = product.specifications instanceof Map 
          ? Array.from(product.specifications.entries())
          : Object.entries(product.specifications);

        if (specsEntries.length > 0) {
          doc
            .fillColor("#0f172a")
            .fontSize(14)
            .text("Specifications", { underline: true, lineGap: 10 });

          for (const [key, val] of specsEntries) {
            drawRow(key, val);
          }
        }
      }

      // 6. Footer
      doc.fontSize(8).fillColor("#94a3b8").text(`Generated automatically by Dynamic PIM Shop. Page 1 of 1.`, 50, doc.page.height - 50, { align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
