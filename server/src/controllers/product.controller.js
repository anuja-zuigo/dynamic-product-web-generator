import { validationResult } from "express-validator";
import { convertPrice } from "../services/currency.service.js";
import Product from "../models/Product.js";
import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
  bulkUpdateSpecificationsService,
  bulkDeleteProductsService,
  bulkStatusChangeService,
} from "../services/product.service.js";

export const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const product = await createProductService({
      ownerId: req.user._id,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { search, category, brand, availability, minPrice, maxPrice, page, limit, sort } = req.query;
    const result = await getAllProductsService(req.user._id, {
      search,
      category,
      brand,
      availability,
      minPrice,
      maxPrice,
      page,
      limit,
      sort
    });

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      data: result.products,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeItems = await Product.countDocuments({ status: "ACTIVE" });
    const lowStock = await Product.countDocuments({ stock: { $lt: 5 } });
    const categoriesList = await Product.distinct("category");

    return res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeItems,
        lowStock,
        categoriesCount: categoriesList.length,
        categories: categoriesList
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await getProductByIdService(
      req.params.id,
      req.user._id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully.",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await updateProductService(
      req.params.id,
      req.user._id,
      req.body
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await deleteProductService(
      req.params.id,
      req.user._id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const bulkUpdateSpecifications = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { productIds, specs } = req.body;
    const result = await bulkUpdateSpecificationsService(req.user._id, productIds, specs);

    return res.status(200).json({
      success: true,
      message: "Specifications updated successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const convertCurrencyAmount = async (req, res) => {
  try {
    const { amount, from, to } = req.query;

    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({
        success: false,
        message: "Valid numeric 'amount' is required in query parameters."
      });
    }

    if (!to) {
      return res.status(400).json({
        success: false,
        message: "'to' currency code is required in query parameters."
      });
    }

    const converted = convertPrice(Number(amount), from || "INR", to);

    return res.status(200).json({
      success: true,
      data: {
        originalAmount: Number(amount),
        from: (from || "INR").toUpperCase(),
        to: to.toUpperCase(),
        convertedAmount: converted
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const bulkDeleteProducts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { productIds } = req.body;
    const result = await bulkDeleteProductsService(req.user._id, productIds);

    return res.status(200).json({
      success: true,
      message: "Products deleted successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const bulkStatusChange = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { productIds, status } = req.body;
    const result = await bulkStatusChangeService(req.user._id, productIds, status);

    return res.status(200).json({
      success: true,
      message: "Statuses updated successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};