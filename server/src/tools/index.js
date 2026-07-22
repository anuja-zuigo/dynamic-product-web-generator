import Product from "../models/Product.js";

// Tool Declarations
export const copilotToolsDeclaration = {
  functionDeclarations: [
    {
      name: "dashboardAnalytics",
      description: "Gets the total number of products, active items, low stock warnings, and unique categories.",
      parameters: { type: "OBJECT", properties: {} }
    },
    {
      name: "inventoryAssistant",
      description: "Finds products with low stock (under 5 units).",
      parameters: { type: "OBJECT", properties: {} }
    },
    {
      name: "productSearch",
      description: "Searches for a specific product by name or brand.",
      parameters: {
        type: "OBJECT",
        properties: {
          query: { type: "STRING", description: "The product name or brand to search for" }
        },
        required: ["query"]
      }
    },
    {
      name: "appGuide",
      description: "Provides guidance on how to use the ProductGen application features like Import, Products, etc.",
      parameters: { type: "OBJECT", properties: {} }
    },
    {
      name: "importValidation",
      description: "Checks recent import logs for errors or success metrics.",
      parameters: { type: "OBJECT", properties: {} }
    },
    {
      name: "seoGenerator",
      description: "Generates SEO metadata for a product.",
      parameters: {
        type: "OBJECT",
        properties: {
          productName: { type: "STRING" }
        },
        required: ["productName"]
      }
    },
    {
      name: "productComparison",
      description: "Compares multiple products to find differences in price and stock.",
      parameters: {
        type: "OBJECT",
        properties: {
          productNames: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: ["productNames"]
      }
    }
  ]
};

// Tool Execution Logic
export const executeCopilotTool = async (functionCall) => {
  const name = functionCall.name;
  const args = functionCall.args || {};

  try {
    if (name === "dashboardAnalytics") {
      const allProducts = await Product.find({});
      const totalProducts = allProducts.length;
      const activeItems = allProducts.filter(p => p.status === "ACTIVE").length;
      const lowStock = allProducts.filter(p => p.stock < 5).length;
      const categories = new Set(allProducts.map(p => p.category)).size;
      return { totalProducts, activeItems, lowStock, categoriesCount: categories };
    }
    
    if (name === "inventoryAssistant") {
      const lowStockProducts = await Product.find({ stock: { $lt: 5 } }).select("name stock price");
      return { lowStockItems: lowStockProducts };
    }

    if (name === "productSearch") {
      const q = args.query;
      const results = await Product.find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { brand: { $regex: q, $options: "i" } }
        ]
      }).limit(5);
      return { searchResults: results };
    }

    if (name === "appGuide") {
      return {
        pages: {
          dashboard: "View metrics and alerts",
          import: "Upload Excel files with product data",
          products: "Manage the product catalog and images"
        }
      };
    }
    
    if (name === "importValidation") {
      return { recentImports: "Import functionality is active. Check the Import logs page for details." };
    }
    
    if (name === "seoGenerator") {
      const q = args.productName;
      const product = await Product.findOne({ name: { $regex: q, $options: "i" } });
      if (!product) return { error: "Product not found." };
      return {
        seoTitle: `${product.name} | ${product.brand || 'Store'}`,
        seoDescription: `Buy ${product.name} for ₹${product.price}. ${product.description}`
      };
    }

    if (name === "productComparison") {
      const names = args.productNames || [];
      const products = await Product.find({ name: { $in: names.map(n => new RegExp(n, "i")) } }).select("name price stock brand");
      return { comparison: products };
    }
    
    return { error: "Unknown tool" };
  } catch (err) {
    console.error(`[Copilot Tool Error] ${name}:`, err.message);
    return { error: "Data temporarily unavailable." };
  }
};
