const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "owner"],
      required: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    // Verification and badges
    isVerified: {
      type: Boolean,
      default: false,
    },
    studentIdVerified: {
      type: Boolean,
      default: false,
    },
    badges: [String],

    // Gamification
    profileCompletion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);