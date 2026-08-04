import User from "../models/User.js";
import cloudinary from "../config/cloudnary.js";
import { uploadAvatar } from "../services/cloudnaryService.js";
import bcrypt from "bcryptjs";
import Wishlist from "../models/Wishlist.js";
import Cart from "../models/Cart.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";
// ===============================
// GET MY PROFILE
// ===============================
export const getProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user._id)
            .select("-password");

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found",
            });

        }

        return res.status(200).json({

            success: true,

            user,

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
// UPDATE PROFILE
// ===============================
export const updateProfile = async (req, res) => {

    try {

        const {
            fullname,
            phone,
            gender,
        } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (fullname) {
            user.fullname = fullname;
        }

        if (phone) {
            user.phone = phone;
        }

        if (gender) {
            user.gender = gender;
        }

        await user.save();

        return res.status(200).json({

            success: true,

            message: "Profile updated successfully",

            user: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                role: user.role,
            },

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
// UPLOAD PROFILE PICTURE
// ===============================
export const uploadProfilePicture = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "Profile picture is required",

            });

        }

        const user = await User.findById(req.user._id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found",

            });

        }

        // Delete old avatar
        if (user.avatar.public_id) {

            await cloudinary.uploader.destroy(
                user.avatar.public_id
            );

        }

        // Upload new avatar
        const uploadedImage =
            await uploadAvatar(req.file.buffer);

        user.avatar = {

            url: uploadedImage.secure_url,

            public_id: uploadedImage.public_id,

        };

        await user.save();

        return res.status(200).json({

            success: true,

            message: "Profile picture uploaded successfully",

            avatar: user.avatar,

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
// CHANGE PASSWORD
// ===============================
export const changePassword = async (req, res) => {

    try {

        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = req.body;

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {

            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });

        }

        if (newPassword !== confirmPassword) {

            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });

        }

        const user = await User.findById(req.user._id);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found",
            });

        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {

            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });

        }
        const samePassword = await bcrypt.compare(
    newPassword,
    user.password
);

if (samePassword) {
    return res.status(400).json({
        success: false,
        message: "New password must be different from the current password",
    });
}

        const hashedPassword =
            await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({

            success: true,

            message: "Password changed successfully",

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
// DELETE ACCOUNT
// ===============================
export const deleteAccount = async (req, res) => {

    try {

        const { password } = req.body;

        if (!password) {

            return res.status(400).json({
                success: false,
                message: "Password is required",
            });

        }

        const user = await User.findById(req.user._id);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found",
            });

        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {

            return res.status(400).json({
                success: false,
                message: "Incorrect password",
            });

        }

        // Delete avatar from Cloudinary
        if (user.avatar?.public_id) {

            await cloudinary.uploader.destroy(
                user.avatar.public_id
            );

        }

        // Delete related data
        await Wishlist.deleteMany({
            user: user._id,
        });

        await Cart.deleteMany({
            user: user._id,
        });

        await Review.deleteMany({
            user: user._id,
        });

        // Delete user
        await User.findByIdAndDelete(user._id);

        return res.status(200).json({

            success: true,

            message: "Account deleted successfully",

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
// ADMIN - GET ALL USERS
// ===============================
export const getAllUsers = async (req, res) => {

    try {

const {
    page = 1,
    limit = 10,
    search,
} = req.query;

const query = {};

if (search) {
    query.$or = [
        {
            fullname: {
                $regex: search,
                $options: "i",
            },
        },
        {
            email: {
                $regex: search,
                $options: "i",
            },
        },
    ];
}

const totalUsers = await User.countDocuments(query);

const users = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

return res.status(200).json({
    success: true,
    totalUsers,
    currentPage: Number(page),
    totalPages: Math.ceil(totalUsers / limit),
    users,
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
// ADMIN - GET SINGLE USER
// ===============================
export const getSingleUser = async (req, res) => {

    try {

        const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
        success: false,
        message: "Invalid User ID",
    });
}

        const user = await User.findById(userId)
            .select("-password");

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found",

            });

        }

        return res.status(200).json({

            success: true,

            user,

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
// ADMIN - UPDATE USER ROLE
// ===============================
export const updateUserRole = async (req, res) => {

    try {

        const { userId } = req.params;

        const { role } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {

            return res.status(400).json({

                success: false,

                message: "Invalid User ID",

            });

        }

        if (!["user", "admin"].includes(role)) {

            return res.status(400).json({

                success: false,

                message: "Role must be either 'user' or 'admin'",

            });

        }

        const user = await User.findById(userId);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found",

            });

        }

        // Prevent changing your own role
        if (user._id.toString() === req.user._id.toString()) {

            return res.status(400).json({

                success: false,

                message: "You cannot change your own role",

            });

        }

        user.role = role;

        await user.save();

        return res.status(200).json({

            success: true,

            message: "User role updated successfully",

            user: {

                _id: user._id,

                fullname: user.fullname,

                email: user.email,

                role: user.role,

            },

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
// ADMIN - DELETE USER
// ===============================
export const adminDeleteUser = async (req, res) => {

    try {

        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid User ID",
            });

        }

        const user = await User.findById(userId);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found",
            });

        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {

            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account",
            });

        }

        // Delete avatar from Cloudinary
        if (user.avatar?.public_id) {

            await cloudinary.uploader.destroy(
                user.avatar.public_id
            );

        }

        // Delete related collections
        await Wishlist.deleteMany({
            user: user._id,
        });

        await Cart.deleteMany({
            user: user._id,
        });

        await Review.deleteMany({
            user: user._id,
        });

        // Optional:
        // Keep Orders for business records
        // OR delete them if your project requires it

        // await Order.deleteMany({
        //     user: user._id,
        // });

        await User.findByIdAndDelete(userId);

        return res.status(200).json({

            success: true,

            message: "User deleted successfully",

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
// ADMIN - USER STATISTICS
// ===============================
export const getUserStatistics = async (req, res) => {

    try {

        const totalUsers =
            await User.countDocuments();

        const verifiedUsers =
            await User.countDocuments({
                isVerified: true,
            });

        const unverifiedUsers =
            await User.countDocuments({
                isVerified: false,
            });

        const adminUsers =
            await User.countDocuments({
                role: "admin",
            });

        const normalUsers =
            await User.countDocuments({
                role: "user",
            });

        const latestUsers =
            await User.find()
                .select("-password")
                .sort({
                    createdAt: -1,
                })
                .limit(5);

        return res.status(200).json({

            success: true,

            statistics: {

                totalUsers,

                verifiedUsers,

                unverifiedUsers,

                adminUsers,

                normalUsers,

            },

            latestUsers,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};