const mongoose = require("mongoose");

const roommatePostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PG",
    },

    personImage: {
      type: String,
      trim: true,
      default: "",
    },

    postType: {
      type: String,
      enum: ["existing_pg", "new_pg"],
      default: "new_pg",
    },

    pgName: {
      type: String,
      trim: true,
      default: "",
    },

    roommatesNeeded: {
      type: Number,
      min: 1,
      default: 1,
    },

    currentRentSplitDetails: {
      type: String,
      trim: true,
      default: "",
    },

    preferredArea: {
      type: String,
      trim: true,
      default: "",
    },

    preferredLocation: {
      type: String,
      trim: true,
      default: "",
    },

    budgetMin: {
      type: Number,
      min: 0,
    },

    budgetMax: {
      type: Number,
      min: 0,
    },

    lifestylePreferences: {
      type: String,
      trim: true,
      default: "",
    },

    occupationOrCollege: {
      type: String,
      trim: true,
      default: "",
    },

    rentShare: {
      type: Number,
      required: true,
    },

    genderPreference: {
      type: String,
      enum: ["male", "female", "any"],
      default: "any",
    },

    habits: {
      smoking: Boolean,
      drinking: Boolean,
      studyFriendly: Boolean,
    },

    description: String,

    // Compatibility score
    compatibilityScore: {
      type: Number,
      default: 0,
    },

    // Personality tags
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("RoommatePost", roommatePostSchema);