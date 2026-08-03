import express from "express";

import auth from "../middleware/authMiddleware.js";

import {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartSummary,
    checkoutValidation
} from "../controller/cartController.js";

const router = express.Router();
router.get("/count", auth, getCartCount);

router.get("/summary", auth, getCartSummary);

router.post(
    "/checkout-validation",
    auth,
    checkoutValidation
);

router.get("/", auth, getCart);

router.delete("/", auth, clearCart);

router.post("/:productId", auth, addToCart);

router.put("/:productId", auth, updateCartQuantity);

router.delete("/:productId", auth, removeFromCart);

export default router;