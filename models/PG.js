const mongoose = require("mongoose");

const pgSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    area: {
      type: String,
      trim: true,
      default: "",
    },

    fullAddress: {
      type: String,
      trim: true,
      default: "",
    },

    mapEmbedUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // Geo coordinates for distance calculation
    coordinates: {
      lat: Number,
      lng: Number,
    },

    rent: {
      type: Number,
      required: true,
    },

    rentBreakdown: {
      type: String,
      trim: true,
      default: "",
    },

    totalBeds: {
      type: Number,
      min: 1,
      default: 1,
    },

    availableBeds: {
      type: Number,
      min: 0,
      default: 1,
    },

    ownerContact: {
      type: String,
      trim: true,
      default: "",
    },

    facilities: [String],

    roomType: {
      type: String,
      enum: ["single", "shared"],
      required: true,
    },

    rules: String,

    images: [String],

    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    availability: {
      type: Boolean,
      default: true,
    },

    genderPreference: {
      type: String,
      enum: ["boys", "girls", "any"],
      default: "any",
    },

    approvedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("PG", pgSchema);