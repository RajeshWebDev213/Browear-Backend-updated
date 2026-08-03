import express from "express";

import { addProduct } from "../controller/productController.js";

import auth from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Add Product (Admin)
router.post(
  "/",
  auth,
  admin,
  upload.single("image"),
  addProduct
);

export default router;