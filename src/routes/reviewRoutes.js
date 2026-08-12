import express from "express";

import auth from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

import {
    addReview,
    getProductReviews,
    updateReview,
    deleteReview,
    getAllReviews,
    getReviewById,
    adminDeleteReview,
    getReviewStats,
} from "../controller/reviewController.js";

const router = express.Router();
// PRODUCT REVIEWS
router.get(
    "/product/:productId",
    getProductReviews
);
// ADMIN ROUTES
router.get(
    "/admin/all",
    auth,
    admin,
    getAllReviews
);

router.get(
    "/admin/stats",
    auth,
    admin,
    getReviewStats
);

router.get(
    "/admin/:reviewId",
    auth,
    admin,
    getReviewById
);

router.delete(
    "/admin/:reviewId",
    auth,
    admin,
    adminDeleteReview
);

// USER ROUTES


router.post(
    "/:productId",
    auth,
    addReview
);

router.put(
    "/:reviewId",
    auth,
    updateReview
);

router.delete(
    "/:reviewId",
    auth,
    deleteReview
);


export default router;