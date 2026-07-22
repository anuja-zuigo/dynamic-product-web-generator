import { body } from "express-validator";
import Product from "../models/Product.js";
import { generateSlug } from "../utils/slug.js";
import fs from "fs/promises";
import path from "path";

export const createProductValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required."),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product description is required."),

  body("brand")
    .optional()
    .trim(),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required."),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number."),

  body("currency")
    .optional()
    .trim(),

  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock cannot be negative."),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Invalid product status."),
];

export const createProductService = async (productData) => {
  if (!productData.slug && productData.name) {
    productData.slug = generateSlug(productData.name) + "-" + Date.now().toString().slice(-4);
  }

  if (!productData.currency) {
    productData.currency = "INR";
  }

  if (!productData.image || typeof productData.image !== 'object' || !productData.image.path) {
    productData.image = {
      originalName: (productData.image && productData.image.originalName) || "default.png",
      storedName: (productData.image && productData.image.storedName) || "default.png",
      path: (productData.image && productData.image.path) || "/uploads/products/default.png"
    };
  }

  const product = await Product.create(productData);
  return product;
};

export const getAllProductsService = async (ownerId, filters = {}) => {
  const { search, category, brand, availability, minPrice, maxPrice, page = 1, limit = 500, sort = 'newest' } = filters;

  const query = {};

  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { name: searchRegex },
      { brand: searchRegex },
      { category: searchRegex },
      { description: searchRegex }
    ];
  }

  if (category) {
    query.category = category;
  }

  if (brand) {
    query.brand = brand;
  }

  if (availability) {
    if (availability === 'in-stock') {
      query.stock = { $gt: 0 };
    } else if (availability === 'out-of-stock') {
      query.stock = 0;
    }
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) {
      query.price.$gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      query.price.$lte = parseFloat(maxPrice);
    }
  }

  let sortQuery = { createdAt: -1 }; // default: newest
  if (sort === 'oldest') {
    sortQuery = { createdAt: 1 };
  } else if (sort === 'price-asc') {
    sortQuery = { price: 1 };
  } else if (sort === 'price-desc') {
    sortQuery = { price: -1 };
  } else if (sort === 'name-asc') {
    sortQuery = { name: 1 };
  } else if (sort === 'name-desc') {
    sortQuery = { name: -1 };
  }

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 500;
  const skipNum = (pageNum - 1) * limitNum;

  const totalProducts = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortQuery)
    .skip(skipNum)
    .limit(limitNum);

  return {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalProducts / limitNum) || 1,
      totalProducts
    }
  };
};

export const getProductByIdService = async (productId, ownerId) => {
  const product = await Product.findById(productId);
  return product;
};

export const updateProductService = async (productId, ownerId, updateData) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
  return product;
};

export const deleteProductService = async (productId, ownerId) => {
  const product = await Product.findByIdAndDelete(productId);
  if (product && product.image && product.image.path && product.image.path !== "/uploads/products/default.png") {
    const referencingProduct = await Product.findOne({ "image.path": product.image.path });
    if (!referencingProduct) {
      try {
        const fullPath = path.join(process.cwd(), product.image.path);
        await fs.unlink(fullPath);
      } catch (err) {
        console.warn(`[IMPORT LOG] Failed to delete unreferenced image file: ${product.image.path} - ${err.message}`);
      }
    }
  }
  return product;
};

export const bulkUpdateSpecificationsService = async (ownerId, productIds, specs) => {
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length === 0) {
    throw new Error("No matching products found.");
  }

  for (const product of products) {
    if (!product.specifications) {
      product.specifications = new Map();
    }
    for (const [key, value] of Object.entries(specs)) {
      product.specifications.set(key, String(value));
    }
    await product.save();
  }

  const updatedIds = products.map(p => p._id);
  const missedIds = productIds.filter(id => !updatedIds.some(uid => uid.toString() === id.toString()));

  return {
    updatedIds,
    missedIds
  };
};

export const bulkDeleteProductsService = async (ownerId, productIds) => {
  const products = await Product.find({ _id: { $in: productIds } });
  const existingIds = products.map(p => p._id);

  if (existingIds.length > 0) {
    await Product.deleteMany({ _id: { $in: existingIds } });

    // Check for unreferenced images and delete them
    for (const product of products) {
      if (product.image && product.image.path && product.image.path !== "/uploads/products/default.png") {
        const isReferenced = await Product.exists({ "image.path": product.image.path });
        if (!isReferenced) {
          try {
            const fullPath = path.join(process.cwd(), product.image.path);
            await fs.unlink(fullPath);
          } catch (err) {
            console.warn(`[IMPORT LOG] Failed to delete unreferenced image file: ${product.image.path}`);
          }
        }
      }
    }
  }

  const missedIds = productIds.filter(id => !existingIds.some(uid => uid.toString() === id.toString()));

  return {
    deletedIds: existingIds,
    missedIds
  };
};

export const bulkStatusChangeService = async (ownerId, productIds, status) => {
  const products = await Product.find({ _id: { $in: productIds } }).select("_id");
  const existingIds = products.map(p => p._id);

  if (existingIds.length > 0) {
    await Product.updateMany(
      { _id: { $in: existingIds } },
      { $set: { status: status.toUpperCase() } }
    );
  }

  const missedIds = productIds.filter(id => !existingIds.some(uid => uid.toString() === id.toString()));

  return {
    updatedIds: existingIds,
    missedIds
  };
};