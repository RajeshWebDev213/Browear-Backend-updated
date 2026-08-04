import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
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

    gender: String,

    dob: Date,

    phone: String,

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
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
phone: {
    type: String,
    default: "",
},
dateOfBirth: {
    type: Date,
},

address: {
    type: String,
    default: "",
},
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);