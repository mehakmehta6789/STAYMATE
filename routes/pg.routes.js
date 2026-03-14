const express = require("express");
const router = express.Router();
const pgController = require("../controllers/pg.controller");
const upload = require("../middleware/upload.middleware");

/**
 * Owner creates PG
 */
router.post("/create", upload.array("images", 5), pgController.createPG);

/**
 * Update PG
 */
router.post("/update/:id", upload.array("images", 5), pgController.updatePG);

/**
 * Toggle availability
 */
router.post("/availability/:id", pgController.toggleAvailability);

/**
 * Delete PG
 */
router.post("/delete/:id", pgController.deletePG);

module.exports = router;