import bcrypt from "bcryptjs";

import User from "../models/User.js";

import generateToken from "../utils/generateToken.js";

import {
  saveOTP,
  verifyOTP as verifyOTPService,
} from "../services/otpService.js";

import sendOTPEmail from "../services/mailService.js";


// ===============================
// SEND OTP
// ===============================
export const sendOTP = async (req, res) => {

  try {

    const { email } = req.body;
    

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const otp = await saveOTP(email);

    const sent = await sendOTPEmail(email, otp);

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
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
// VERIFY OTP
// ===============================
export const verifyOTP = async (req, res) => {

  try {

    const {
      fullname,
      email,
      password,
      otp,
    } = req.body;

    if (
      !fullname ||
      !email ||
      !password ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

 const validOTP = await verifyOTPService(
  email,
  otp
);

    if (!validOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid or Expired OTP",
      });
    }

    const exists = await User.findOne({
      email,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      fullname,
      email,
      password: hashedPassword,
      isVerified: true,
    });

    const token = generateToken(user._id);

    return res.status(201).json({

      success: true,

      message: "Signup Successful",

      token,

      user: {

        id: user._id,

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
// LOGIN
// ===============================
export const login = async (req, res) => {

    try {

        const { email, password } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and Password are required",
            });

        }

        const user = await User.findOne({ email });
        if (!user.isVerified) {
   return res.status(401).json({
      success:false,
      message:"Please verify your email first"
   });
}

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

            return res.status(401).json({
                success: false,
                message: "Invalid Credentials",
            });

        }

        const token = generateToken(user._id);

        return res.status(200).json({

            success: true,

            message: "Login Successful",

            token,

            user: {

                id: user._id,

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
// GET CURRENT USER
// ===============================
export const me = async (req, res) => {

    try {

        return res.status(200).json({

            success: true,

            user: req.user,

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// ===============================
// LOGOUT
// ===============================
export const logout = async (req, res) => {

    return res.status(200).json({

        success: true,

        message: "Logout Successful",

    });

};



