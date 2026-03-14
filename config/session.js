const session = require("express-session");

/**
 * Session configuration
 */
const sessionConfig = session({
  name: "staymate.sid",
  secret: process.env.SESSION_SECRET || "staymate_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
});

module.exports = sessionConfig;