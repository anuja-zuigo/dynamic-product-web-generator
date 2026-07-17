import { validationResult } from "express-validator";
import {
  signupService,
  loginService,
} from "../services/auth.service.js";

export const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const result = await signupService(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const result = await loginService(req.body);

    return res.status(200).json({
        success: true,
        message: "Login successful.",
        data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully.",
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};