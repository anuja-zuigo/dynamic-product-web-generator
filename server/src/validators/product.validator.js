import { body } from "express-validator";

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
    .trim()
    .notEmpty()
    .withMessage("Currency is required."),

  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock cannot be negative."),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Invalid product status."),
];

export const bulkUpdateSpecificationsValidator = [
  body("productIds")
    .isArray({ min: 1 })
    .withMessage("productIds must be a non-empty array of product IDs."),
  body("productIds.*")
    .isMongoId()
    .withMessage("Each product ID must be a valid MongoDB ObjectId."),
  body("specs")
    .isObject()
    .withMessage("specs must be a non-empty object containing specifications."),
  body("specs")
    .custom((value) => {
      if (!value || Object.keys(value).length === 0) {
        throw new Error("specs object cannot be empty.");
      }
      for (const [key, val] of Object.entries(value)) {
        if (typeof val !== "string" && typeof val !== "number") {
          throw new Error(`Specification value for key "${key}" must be a string or number.`);
        }
      }
      return true;
    })
];

export const bulkDeleteProductsValidator = [
  body("productIds")
    .isArray({ min: 1 })
    .withMessage("productIds must be a non-empty array of product IDs."),
  body("productIds.*")
    .isMongoId()
    .withMessage("Each product ID must be a valid MongoDB ObjectId.")
];

export const bulkStatusChangeValidator = [
  body("productIds")
    .isArray({ min: 1 })
    .withMessage("productIds must be a non-empty array of product IDs."),
  body("productIds.*")
    .isMongoId()
    .withMessage("Each product ID must be a valid MongoDB ObjectId."),
  body("status")
    .trim()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be either ACTIVE or INACTIVE.")
];