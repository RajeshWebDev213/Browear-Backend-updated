import mongoose from "mongoose";

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ===============================
// ADD TO CART
// ===============================
export const addToCart = async (req, res) => {

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

        if (product.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: "Product is out of stock",
            });
        }

        const cartItem = await Cart.findOne({
            user: req.user._id,
            product: productId,
        });

        if (cartItem) {

            cartItem.quantity += 1;

            await cartItem.save();

            return res.status(200).json({
                success: true,
                message: "Cart quantity updated",
                cartItem,
            });

        }

        const newCartItem = await Cart.create({
            user: req.user._id,
            product: productId,
            quantity: 1,
        });

        return res.status(201).json({
            success: true,
            message: "Product added to cart",
            cartItem: newCartItem,
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
// GET USER CART
// ===============================
export const getCart = async (req, res) => {

    try {

        const cartItems = await Cart.find({
            user: req.user._id,
        })
        .populate({
            path: "product",
            select: "-public_id",
        });

        let subtotal = 0;

        cartItems.forEach((item) => {

            subtotal += item.product.price * item.quantity;

        });

        return res.status(200).json({

            success: true,

            count: cartItems.length,

            subtotal,

            cartItems,

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
// UPDATE CART QUANTITY
// ===============================
export const updateCartQuantity = async (req, res) => {

    try {

        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Product ID",
            });
        }

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1",
            });
        }

        const cartItem = await Cart.findOne({
            user: req.user._id,
            product: productId,
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        const product = await Product.findById(productId);

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available`,
            });
        }

        cartItem.quantity = quantity;

        await cartItem.save();

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            cartItem,
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
// REMOVE FROM CART
// ===============================
export const removeFromCart = async (req, res) => {

    try {

        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Product ID",
            });
        }

        const cartItem = await Cart.findOneAndDelete({
            user: req.user._id,
            product: productId,
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
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
// CLEAR CART
// ===============================
export const clearCart = async (req, res) => {

    try {

        await Cart.deleteMany({
            user: req.user._id,
        });

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
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
// GET CART COUNT
// ===============================
export const getCartCount = async (req, res) => {

    try {

        const result = await Cart.aggregate([
            {
                $match: {
                    user: req.user._id,
                },
            },
            {
                $group: {
                    _id: null,
                    totalItems: {
                        $sum: "$quantity",
                    },
                },
            },
        ]);

        const count =
            result.length > 0
                ? result[0].totalItems
                : 0;

        return res.status(200).json({
            success: true,
            count,
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
// CART SUMMARY
// ===============================
export const getCartSummary = async (req, res) => {

    try {

        const cartItems = await Cart.find({
            user: req.user._id,
        }).populate("product");

        let totalItems = 0;
        let subtotal = 0;
        let totalDiscount = 0;

        for (const item of cartItems) {

            const product = item.product;

            if (!product) continue;

            totalItems += item.quantity;

            const originalPrice = product.price;

            const discountPrice =
                originalPrice -
                (originalPrice * product.discount) / 100;

            subtotal += originalPrice * item.quantity;

            totalDiscount +=
                (originalPrice - discountPrice) * item.quantity;

        }

        const shipping = subtotal >= 999 ? 0 : 99;

        const tax = Number(((subtotal - totalDiscount) * 0.18).toFixed(2));

        const grandTotal =
            subtotal -
            totalDiscount +
            shipping +
            tax;

        return res.status(200).json({

            success: true,

            summary: {

                totalProducts: cartItems.length,

                totalItems,

                subtotal,

                discount: totalDiscount,

                shipping,

                tax,

                grandTotal,

            }

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};

// =================================
// CHECKOUT VALIDATION
// =================================
export const checkoutValidation = async (req, res) => {

    try {

        const cartItems = await Cart.find({
            user: req.user._id,
        }).populate("product");

        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty",
            });
        }

        let subtotal = 0;
        let totalDiscount = 0;

        const validatedItems = [];

        for (const item of cartItems) {

            const product = item.product;

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "One or more products no longer exist",
                });
            }

            // Optional if Product has a status field
            if (product.status && product.status !== "active") {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} is currently unavailable`,
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} has only ${product.stock} items left`,
                });
            }

            const originalPrice = product.price;

            const finalPrice =
                originalPrice -
                (originalPrice * product.discount) / 100;

            subtotal += finalPrice * item.quantity;

            totalDiscount +=
                (originalPrice - finalPrice) * item.quantity;

            validatedItems.push({
                productId: product._id,
                name: product.name,
                quantity: item.quantity,
                price: finalPrice,
                image: product.image,
            });

        }

        const shipping = subtotal >= 999 ? 0 : 99;

        const tax =
            Number((subtotal * 0.18).toFixed(2));

        const grandTotal =
            subtotal +
            shipping +
            tax;

        return res.status(200).json({

            success: true,

            message: "Cart validation successful",

            summary: {

                totalProducts: validatedItems.length,

                subtotal,

                discount: totalDiscount,

                shipping,

                tax,

                grandTotal,

            },

            items: validatedItems,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    }

};