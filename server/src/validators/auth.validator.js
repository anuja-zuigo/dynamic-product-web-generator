import { body } from "express-validator";

export const signupValidator = [
  body().custom((value, { req }) => {
    const userName = req.body.fullName || req.body.name;
    if (!userName || userName.trim().length < 2 || userName.trim().length > 50) {
      throw new Error("Full name must be between 2 and 50 characters.");
    }
    return true;
  }),

  body("email")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address."),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 6, max: 32 })
    .withMessage("Password must be at least 6 characters.")
];

export const loginValidator = [
  body("email")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address."),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
];