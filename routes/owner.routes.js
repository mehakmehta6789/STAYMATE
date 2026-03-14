const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/owner.controller");
const profileUpload = require("../middleware/profileUpload.middleware");

/**
 * Owner Dashboard
 */
router.get("/dashboard", ownerController.dashboard);

/**
 * PG Management
 */
router.get("/add-pg", (req, res) => {
  res.render("owner/add-pg");
});

router.get("/my-pgs", ownerController.myPGs);

router.get("/enquiries", require("../controllers/pgRequest.controller").listForOwner);

router.get("/reviews", ownerController.reviewsPage);

router.get("/profile", ownerController.getProfile);
router.post("/profile", profileUpload.single("profileImage"), ownerController.updateProfile);

module.exports = router;