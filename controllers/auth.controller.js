const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AUTH_COOKIE = "staymate.token";

const issueAuthCookie = (res, user) => {
  const payload = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || "staymate_jwt_secret",
    { expiresIn: "1d" }
  );

  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24,
  });
};

/**
 * Register User (Student / Owner)
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).render("common/register", {
        error: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render("common/register", {
        error: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    issueAuthCookie(res, user);

    res.redirect(`/${role}/dashboard`);
  } catch (err) {
    console.error(err);
    res.status(500).render("common/register", {
      error: "Registration failed. Please try again.",
    });
  }
};

/**
 * Login User
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render("common/login", {
        error: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).render("common/login", {
        error: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).render("common/login", {
        error: "Invalid email or password",
      });
    }

    issueAuthCookie(res, user);

    res.redirect(`/${user.role}/dashboard`);
  } catch (err) {
    console.error(err);
    res.status(500).render("common/login", {
      error: "Login failed. Please try again.",
    });
  }
};

/**
 * Logout
 */
exports.logout = (req, res) => {
  res.clearCookie(AUTH_COOKIE);
  if (!req.session) {
    res.redirect("/");
    return;
  }

  req.session.destroy(() => {
    res.redirect("/");
  });
};