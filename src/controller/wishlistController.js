import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

// ============================
// ADD TO WISHLIST
// ============================
export const addToWishlist = async (req,res)=>{

    try{

        const {productId}=req.params;

        if(!mongoose.Types.ObjectId.isValid(productId)){
            return res.status(400).json({
                success:false,
                message:"Invalid Product ID"
            });
        }

        const product=await Product.findById(productId);

        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found"
            });
        }

        const exists=await Wishlist.findOne({
            user:req.user._id,
            product:productId
        });

        if(exists){
            return res.status(400).json({
                success:false,
                message:"Product already in wishlist"
            });
        }

        const wishlist=await Wishlist.create({
            user:req.user._id,
            product:productId
        });

        return res.status(201).json({
            success:true,
            message:"Added to wishlist",
            wishlist
        });

    }
    catch(error){

        console.log(error);

        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        });

    }

};
// =================================
// GET USER WISHLIST
// =================================
export const getWishlist = async (req, res) => {
    try {

        const wishlist = await Wishlist.find({
            user: req.user._id,
        })
        .populate({
            path: "product",
            select: "-public_id",
        })
        .sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            count: wishlist.length,
            wishlist,
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};


// ============================
// REMOVE FROM WISHLIST
// ============================
export const removeFromWishlist = async (req, res) => {
    try {

        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Product ID",
            });
        }

        const wishlist = await Wishlist.findOneAndDelete({
            user: req.user._id,
            product: productId,
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Removed from wishlist",
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
// TOGGLE WISHLIST
// =================================
export const toggleWishlist = async (req, res) => {
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

        const existing = await Wishlist.findOne({
            user: req.user._id,
            product: productId,
        });

        // Remove if already exists
        if (existing) {

            await Wishlist.findByIdAndDelete(existing._id);

            return res.status(200).json({
                success: true,
                action: "removed",
                message: "Removed from wishlist",
            });
        }

        // Add if it doesn't exist
        await Wishlist.create({
            user: req.user._id,
            product: productId,
        });

        return res.status(201).json({
            success: true,
            action: "added",
            message: "Added to wishlist",
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
// GET WISHLIST COUNT
// =================================
export const getWishlistCount = async (req, res) => {
    try {

        const count = await Wishlist.countDocuments({
            user: req.user._id,
        });

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