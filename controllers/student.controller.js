const StudentProfile = require("../models/StudentProfile");
const PGRequest = require("../models/PGRequest");
const User = require("../models/User");

/**
 * Student Dashboard
 */
exports.dashboard = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.session.user._id });
    const account = await User.findById(req.session.user._id).select("name profileImage").lean();
    res.render("student/dashboard", { pageCSS: "student-dashboard.css", profile: profile || null, account: account || null });
  } catch (err) {
    console.error(err);
    res.render("student/dashboard", { pageCSS: "student-dashboard.css", profile: null, account: null });
  }
};

/**
 * View Profile
 */
exports.getProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.session.user._id });
    const account = await User.findById(req.session.user._id).select("name email role").lean();
    res.render("student/profile", { profile: profile || {}, account: account || null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading profile");
  }
};

/**
 * Update Profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const {
      collegeName,
      course,
      year,
      budgetMin,
      budgetMax,
      foodPreference,
      lifestyle,
      smoking,
      drinking,
      cleanliness,
      sleepTime,
    } = req.body;

    const updatePayload = {
      collegeName,
      course,
      year,
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      foodPreference,
      lifestyle,
      habits: {
        smoking: Boolean(smoking),
        drinking: Boolean(drinking),
        cleanliness,
        sleepTime,
      },
    };

    if (req.file) {
      updatePayload.profileImage = `/images/profile/${req.file.filename}`;
    }

    await StudentProfile.findOneAndUpdate(
      { user: req.session.user._id },
      updatePayload,
      { upsert: true, new: true }
    );
    res.redirect("/student/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating profile");
  }
};

/**
 * Set student's current PG (used to show residents in PG details)
 */
exports.setCurrentPg = async (req, res) => {
  try {
    const { pgId } = req.body;
    if (!pgId) return res.status(400).send("pgId is required");

    await StudentProfile.findOneAndUpdate(
      { user: req.session.user._id },
      { $set: { currentPg: pgId } },
      { upsert: true, new: true }
    );

    res.redirect(`/pg/${pgId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error setting current PG");
  }
};

/**
 * Clear student's current PG
 */
exports.clearCurrentPg = async (req, res) => {
  try {
    await StudentProfile.findOneAndUpdate(
      { user: req.session.user._id },
      { $set: { currentPg: null } },
      { upsert: true, new: true }
    );

    res.redirect("/student/profile");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error clearing current PG");
  }
};

/**
 * Student: list own PG requests
 */
exports.myRequests = async (req, res) => {
  try {
    const requests = await PGRequest.find({ student: req.session.user._id })
      .populate("pg", "title location rent")
      .sort({ createdAt: -1 })
      .lean();

    res.render("student/requests", {
      requests: requests || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading your requests");
  }
};