const mongoose = require("mongoose");

const ownerStatsSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  totalViews: { type: Number, default: 0 },
  totalEnquiries: { type: Number, default: 0 },
  occupancyRate: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  monthlyEarningEstimate: { type: Number, default: 0 },
});

module.exports = mongoose.model("OwnerStats", ownerStatsSchema);
