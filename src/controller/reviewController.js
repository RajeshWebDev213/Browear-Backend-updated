import mongoose from "mongoose";

import Review from "../models/Review.js";
import Product from "../models/Product.js";

// ===============================
// ADD REVIEW
// ===============================
export const addReview = async (req, res) => {

    try {

        const { productId } = req.params;

        const { rating, comment } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Product ID",
            });
        }

        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: "Rating and Comment are required",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const alreadyReviewed = await Review.findOne({

            user: req.user._id,

            product: productId,

        });

        if (alreadyReviewed) {

            return res.status(400).json({

                success: false,

                message: "You have already reviewed this product.",

            });

        }

        const review = await Review.create({

            user: req.user._id,

            product: productId,

            rating,

            comment,

        });
        await updateProductRating(productId);

        return res.status(201).json({

            success: true,

            message: "Review added successfully",

            review,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// ===============================
// GET PRODUCT REVIEWS
// ===============================
export const getProductReviews = async (req, res) => {

    try {

        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Product ID",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const reviews = await Review.find({
            product: productId,
        })
        .populate("user", "fullname")
        .sort({ createdAt: -1 });

        return res.status(200).json({

            success: true,

            count: reviews.length,

            reviews,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};


// ===============================
// UPDATE REVIEW
// ===============================
export const updateReview = async (req, res) => {

    try {

        const { reviewId } = req.params;

        const { rating, comment } = req.body;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid Review ID",
            });

        }

        if (!rating || !comment) {

            return res.status(400).json({
                success: false,
                message: "Rating and Comment are required",
            });

        }

        const review = await Review.findById(reviewId);

        if (!review) {

            return res.status(404).json({
                success: false,
                message: "Review not found",
            });

        }

        // Only owner can update
        if (review.user.toString() !== req.user._id.toString()) {

            return res.status(403).json({
                success: false,
                message: "Unauthorized",
            });

        }

        review.rating = rating;
        review.comment = comment;

        await review.save();

        await updateProductRating(productId);

        return res.status(200).json({

            success: true,

            message: "Review updated successfully",

            review,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// ===============================
// DELETE REVIEW
// ===============================
export const deleteReview = async (req, res) => {

    try {

        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid Review ID",
            });

        }

        const review = await Review.findById(reviewId);

        if (!review) {

            return res.status(404).json({
                success: false,
                message: "Review not found",
            });

        }

        // Only review owner can delete
        if (review.user.toString() !== req.user._id.toString()) {

            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this review",
            });

        }

        const productId = review.product;

await Review.findByIdAndDelete(reviewId);

await updateProductRating(productId);

        return res.status(200).json({

            success: true,

            message: "Review deleted successfully",

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};

// ===============================
// UPDATE PRODUCT RATING
// ===============================
const updateProductRating = async (productId) => {

    const reviews = await Review.find({
        product: productId,
    });

    const numReviews = reviews.length;

    let averageRating = 0;

    if (numReviews > 0) {

        const totalRating = reviews.reduce(

            (sum, review) => sum + review.rating,

            0

        );

        averageRating = totalRating / numReviews;

    }

    await Product.findByIdAndUpdate(

        productId,

        {

            averageRating,

            numReviews,

        }

    );

};

// ===============================
// ADMIN DELETE REVIEW
// ===============================
export const adminDeleteReview = async (req, res) => {

    try {

        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid Review ID",
            });

        }

        const review = await Review.findById(reviewId);

        if (!review) {

            return res.status(404).json({
                success: false,
                message: "Review not found",
            });

        }

        const productId = review.product;

        await Review.findByIdAndDelete(reviewId);

        await updateProductRating(productId);

        return res.status(200).json({

            success: true,

            message: "Review deleted successfully by admin",

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// ===============================
// ADMIN REVIEW STATISTICS
// ===============================
export const getReviewStats = async (req, res) => {

    try {

        const totalReviews =
            await Review.countDocuments();

        const ratingStats =
            await Review.aggregate([
                {
                    $group: {
                        _id: "$rating",
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ]);

        const averageRating =
            await Review.aggregate([
                {
                    $group: {
                        _id: null,
                        averageRating: {
                            $avg: "$rating",
                        },
                    },
                },
            ]);

        const ratings = {

            1: 0,

            2: 0,

            3: 0,

            4: 0,

            5: 0,

        };

        ratingStats.forEach((item) => {

            ratings[item._id] = item.count;

        });

        const latestReviews =
            await Review.find()
                .populate("user", "fullname email")
                .populate("product", "name")
                .sort({
                    createdAt: -1,
                })
                .limit(5);

        return res.status(200).json({

            success: true,

            statistics: {

                totalReviews,

                averageRating:
                    averageRating.length > 0
                        ? Number(
                              averageRating[0].averageRating.toFixed(1)
                          )
                        : 0,

                oneStar: ratings[1],

                twoStar: ratings[2],

                threeStar: ratings[3],

                fourStar: ratings[4],

                fiveStar: ratings[5],

            },

            latestReviews,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};