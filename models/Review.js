const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    pg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PG",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    foodQuality: Number,
    cleanliness: Number,
    safety: Number,

    comment: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);