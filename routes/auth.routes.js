const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

/**
 * Auth Pages
 */
router.get("/login", (req, res) => {
  res.render("common/login");
});

router.get("/register", (req, res) => {
  res.render("common/register");
});

/**
 * Auth Actions
 */
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);

module.exports = router;