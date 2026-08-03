import express from "express";

import auth from "../middleware/authMiddleware.js";

import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    toggleWishlist,
    getWishlistCount,
} from "../controller/wishlistController.js";

const router = express.Router();

// Count
router.get("/count", auth, getWishlistCount);

// Get Wishlist
router.get("/", auth, getWishlist);

// Toggle
router.post("/toggle/:productId", auth, toggleWishlist);

// Add
router.post("/:productId", auth, addToWishlist);

// Remove
router.delete("/:productId", auth, removeFromWishlist);

export default router;