const PG = require("../models/PG");
const Review = require("../models/Review");
const User = require("../models/User");

/**
 * Owner Dashboard
 */
exports.dashboard = async (req, res) => {
  try {
    const pgs = await PG.find({ owner: req.session.user._id });
    const account = await User.findById(req.session.user._id).select("name email role profileImage").lean();
    res.render("owner/dashboard", {
      pageCSS: "owner-dashboard.css",
      pgs: pgs || [],
      account: account || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading dashboard");
  }
};

/**
 * View Owner PGs
 */
exports.myPGs = async (req, res) => {
  try {
    const pgs = await PG.find({ owner: req.session.user._id });
    res.render("owner/my-pgs", { pgs: pgs || [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading PGs");
  }
};

/**
 * Owner: view reviews for own PGs
 */
exports.reviewsPage = async (req, res) => {
  try {
    const ownerId = req.session.user._id;
    const ownerPGs = await PG.find({ owner: ownerId }).select("_id").lean();
    const pgIds = ownerPGs.map((p) => p._id);

    const reviews =
      pgIds.length > 0
        ? await Review.find({ pg: { $in: pgIds } })
            .sort({ createdAt: -1 })
            .populate("user", "name")
            .populate("pg", "title location")
        : [];

    res.render("owner/reviews", { reviews: reviews || [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading reviews");
  }
};

exports.getProfile = async (req, res) => {
  try {
    const account = await User.findById(req.session.user._id).select("name email role profileImage").lean();
    res.render("owner/profile", { pageCSS: "owner-profile.css", account: account || null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading profile");
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updatePayload = {
      name: req.body.name,
    };

    if (req.file) {
      updatePayload.profileImage = `/images/profile/${req.file.filename}`;
    }

    await User.findByIdAndUpdate(req.session.user._id, updatePayload, { new: true });
    res.redirect("/owner/profile");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating profile");
  }
};