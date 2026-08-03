import express from "express";

import upload from "../middleware/uploadMiddleware.js";
import auth from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

import {
  addProduct,
  getProducts,
  getProduct,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
} from "../controller/productController.js";

const router = express.Router();

// Public Routes
router.get("/", getProducts);

router.get("/category/:category", getProductsByCategory);

router.get("/:id", getProduct);

// Update Product
router.put(
  "/:id",
  auth,
  admin,
  upload.single("image"),
  updateProduct
);

// Delete Product
router.delete(
  "/:id",
  auth,
  admin,
  deleteProduct
);

// Admin Route
router.post(
  "/",
  auth,
  admin,
  upload.single("image"),
  addProduct
);

export default router;