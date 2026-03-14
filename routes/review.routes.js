const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");

/**
 * Add Review
 */
router.post("/add/:pgId", reviewController.addReview);

/**
 * Get reviews for PG
 */
router.get("/pg/:pgId", reviewController.getPGReviews);

module.exports = router;