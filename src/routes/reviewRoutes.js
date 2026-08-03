import express from "express";

import auth from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

import {

    addReview,

    getProductReviews,

    updateReview,

    deleteReview,

    adminDeleteReview,
    getReviewStats

} from "../controller/reviewController.js";

const router = express.Router();

router.get(
    "/admin/stats",
    auth,
    admin,
    getReviewStats
);

router.post("/:productId", auth, addReview);

router.get("/:productId", getProductReviews);

router.delete(
    "/admin/:reviewId",
    auth,
    admin,
    adminDeleteReview
);

router.put("/:reviewId", auth, updateReview);

router.delete("/:reviewId", auth, deleteReview);

export default router;