const mongoose = require("mongoose");

const pgRequestSchema = new mongoose.Schema(
  {
    pg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PG",
      required: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 'stay' = normal stay request, 'roommate' = wants to share room
    type: {
      type: String,
      enum: ["stay", "roommate"],
      default: "stay",
    },

    message: {
      type: String,
      trim: true,
    },

    expectedRentShare: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PGRequest", pgRequestSchema);

