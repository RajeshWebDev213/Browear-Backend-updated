import express from "express";

import auth from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {

    getProfile,
    updateProfile,
    uploadProfilePicture,
    changePassword,
    deleteAccount,
    getAllUsers,
    getSingleUser,
    updateUserRole,
    adminDeleteUser,
    getUserStatistics

} from "../controller/profileController.js";

const router = express.Router();

router.get(
    "/admin/stats",
    auth,
    admin,
    getUserStatistics
);

router.get(
    "/admin/users",
    auth,
    admin,
    getAllUsers
);

router.get(
    "/admin/user/:userId",
    auth,
    admin,
    getSingleUser
);

router.put(
    "/admin/user-role/:userId",
    auth,
    admin,
    updateUserRole
);

router.get("/me", auth, getProfile);

router.put("/update", auth, updateProfile);

router.put(
    "/avatar",
    auth,
    upload.single("avatar"),
    uploadProfilePicture
);

router.put(
    "/change-password",
    auth,
    changePassword
);

router.delete(
    "/delete",
    auth,
    deleteAccount
);
router.delete(
    "/admin/user/:userId",
    auth,
    admin,
    adminDeleteUser
);
export default router;