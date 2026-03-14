const Review = require("../models/Review");

/**
 * Add Review
 */
exports.addReview = async (req, res) => {
  try {
    if (!req.body.rating || !req.body.comment) {
      return res.status(400).send("Rating and comment are required");
    }

    await Review.create({
      pg: req.params.pgId,
      user: req.session.user._id,
      ...req.body,
    });
    res.redirect(`/pg/${req.params.pgId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding review");
  }
};

/**
 * Get Reviews for PG
 */
exports.getPGReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ pg: req.params.pgId }).populate(
      "user",
      "name email"
    );
    res.json(reviews || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching reviews" });
  }
};