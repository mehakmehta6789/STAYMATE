const express = require("express");
const router = express.Router();
const roommateController = require("../controllers/roommate.controller");
const role = require("../middleware/role.middleware");
const roommateUpload = require("../middleware/roommateUpload.middleware");

/**
 * Roommate Finder Page
 */
router.get("/", roommateController.finderPage);

/**
 * Create roommate post
 */
router.post(
	"/create",
	role("student"),
	roommateUpload.single("personImage"),
	roommateController.createPost
);

/**
 * Update roommate post
 */
router.post(
	"/update/:id",
	role("student"),
	roommateUpload.single("personImage"),
	roommateController.updatePost
);

/**
 * Delete roommate post
 */
router.post("/delete/:id", role("student"), roommateController.deletePost);

/**
 * Search roommates
 */
router.get("/search", roommateController.search);

/**
 * Compatibility details
 */
router.get("/compatibility/:userId", role("student"), roommateController.compatibilityPage);

/**
 * Send roommate request
 */
router.post("/request/:postId", role("student"), roommateController.sendRequest);

/**
 * Update roommate request status
 */
router.post("/request/status/:id", role("student"), roommateController.updateRequestStatus);

/**
 * Roommate requests page
 */
router.get("/requests", role("student"), roommateController.requestsPage);

module.exports = router;