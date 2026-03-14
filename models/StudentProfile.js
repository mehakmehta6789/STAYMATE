const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    collegeName: String,
    course: String,
    year: String,

    profileImage: String,

    // Personality tags & daily snapshot
    tags: [String],
    dailySnapshot: {
      wakeUp: String,
      sleep: String,
      food: String,
      silenceOrMusic: String,
    },

    budgetMin: Number,
    budgetMax: Number,

    foodPreference: {
      type: String,
      enum: ["veg", "non-veg", "both"],
    },

    lifestyle: {
      type: String,
      enum: ["quiet", "social", "night-owl"],
    },

    habits: {
      smoking: Boolean,
      drinking: Boolean,
      cleanliness: {
        type: String,
        enum: ["low", "medium", "high"],
      },
      sleepTime: {
        type: String,
        enum: ["early", "late"],
      },
    },

    // The PG the student is currently living in (optional)
    currentPg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PG",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);