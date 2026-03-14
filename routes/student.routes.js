const express = require("express");
const router = express.Router();
const studentController = require("../controllers/student.controller");
const profileUpload = require("../middleware/profileUpload.middleware");

/**
 * Student Dashboard
 */
router.get("/dashboard", studentController.dashboard);

/**
 * Student Profile
 */
router.get("/profile", studentController.getProfile);
router.post("/profile", profileUpload.single("profileImage"), studentController.updateProfile);

/**
 * Student PG requests
 */
router.get("/requests", studentController.myRequests);

/**
 * Mark current PG (resident visibility)
 */
router.post("/current-pg", studentController.setCurrentPg);
router.post("/current-pg/clear", studentController.clearCurrentPg);

/**
 * Student Chats
 */
router.get("/chat", (req, res) => {
  res.redirect("/chat");
});

module.exports = router;