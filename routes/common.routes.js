const express = require("express");
const router = express.Router();
const PG = require("../models/PG");
const Review = require("../models/Review");
const StudentProfile = require("../models/StudentProfile");
const mongoose = require("mongoose");

/**
 * Public Pages
 */

// Home
router.get("/", async (req, res) => {
  try {
    const homePgs = await PG.find({ availability: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    res.render("common/home", {
      pageCSS: "home.css",
      homePgs: homePgs || [],
    });
  } catch (error) {
    console.error(error);
    res.render("common/home", {
      pageCSS: "home.css",
      homePgs: [],
    });
  }
});

// PG List with filters
router.get("/pgs", async (req, res) => {
  try {
    const { location, minRent, maxRent, gender, collegeName, course, year } = req.query;

    const query = { availability: true };

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    if (gender) {
      query.genderPreference = gender;
    }

    if (collegeName || course || year) {
      const profileFilter = {};
      if (collegeName) profileFilter.collegeName = collegeName;
      if (course) profileFilter.course = course;
      if (year) profileFilter.year = year;

      const profiles = await StudentProfile.find(profileFilter)
        .select("currentPg")
        .lean();

      const pgIds = profiles
        .map((profile) => profile.currentPg)
        .filter((id) => mongoose.Types.ObjectId.isValid(id));

      query._id = { $in: pgIds.length ? pgIds : [] };
    }

    const pgs = await PG.find(query)
      .populate("approvedStudents", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.render("common/pg-list", {
      pageCSS: "pg-list.css",
      pgs,
      filter: {
        location,
        minRent,
        maxRent,
        gender,
        collegeName,
        course,
        year,
      },
    });
  } catch (error) {
    console.error(error);

    res.render("common/pg-list", {
      pageCSS: "pg-list.css",
      pgs: [],
      filter: {
        location: "",
        minRent: "",
        maxRent: "",
        gender: "",
        collegeName: "",
        course: "",
        year: "",
      },
      error: "Error loading PGs",
    });
  }
});

// PG Details
router.get("/pg/:id", async (req, res) => {
  try {
    const pg = await PG.findById(req.params.id)
      .populate("owner", "name email")
      .populate("approvedStudents", "name email")
      .lean();

    if (!pg) {
      return res.status(404).render("common/404", {
        message: "PG not found",
      });
    }

    const reviews = await Review.find({ pg: pg._id })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    const approvedStudentIds = (pg.approvedStudents || []).map((student) =>
      student._id.toString()
    );

    const currentUserId = req.user ? req.user._id.toString() : null;
    const isOwner =
      req.user &&
      req.user.role === "owner" &&
      pg.owner &&
      pg.owner._id.toString() === currentUserId;

    const isApprovedStudent =
      req.user &&
      req.user.role === "student" &&
      approvedStudentIds.includes(currentUserId);

    res.render("common/pg-details", {
      pageCSS: "pg-details.css",
      pg,
      reviews: reviews || [],
      residents: pg.approvedStudents || [],
      isApprovedStudent,
      canRequestToJoin:
        req.user &&
        req.user.role === "student" &&
        !isApprovedStudent &&
        pg.availableBeds > 0,
      canViewOwnerContact: Boolean(isOwner || isApprovedStudent),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading PG details");
  }
});


module.exports = router;