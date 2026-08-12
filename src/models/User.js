import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
    fullname: {
        type: String,
        trim:true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    phone: {
        type: String,
        default: "",
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: "Other",
    },

    dateOfBirth: {
        type: Date,
    },

    address: {
        type: String,
        default: "",
    },

    avatar: {
        url: {
            type: String,
            default: "",
        },
        public_id: {
            type: String,
            default: "",
        },
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },

    isVerified: {
        type: Boolean,
        default: false,
    },

},
{
    timestamps: true,
});

export default mongoose.model("User", userSchema);