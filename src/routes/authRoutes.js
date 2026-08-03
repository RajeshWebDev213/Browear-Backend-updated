import express from "express";

import {

    sendOTP,

    verifyOTP,

    login,

    me,

    logout,

} from "../controller/authController.js";

import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send-otp", sendOTP);

router.post("/verify-otp", verifyOTP);

router.post("/login", login);

router.get("/me", auth, me);

router.post("/logout", auth, logout);

export default router;