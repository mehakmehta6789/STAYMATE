const express = require("express");
const router = express.Router();
const pgRequestController = require("../controllers/pgRequest.controller");
const role = require("../middleware/role.middleware");

// Student creates request (stay / roommate)
router.post("/create", role("student"), pgRequestController.createRequest);

// Owner views all requests for their PGs
router.get("/owner", role("owner"), pgRequestController.listForOwner);

// Owner updates request status
router.post("/status/:id", role("owner"), pgRequestController.updateStatus);

module.exports = router;

