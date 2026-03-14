const jwt = require("jsonwebtoken");

const AUTH_COOKIE = "staymate.token";

const getTokenFromRequest = (req) => {
  if (req.cookies && req.cookies[AUTH_COOKIE]) {
    return req.cookies[AUTH_COOKIE];
  }

  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7);
  }

  return null;
};

const decodeToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "staymate_jwt_secret");
  } catch (_err) {
    return null;
  }
};

const attachUserToRequest = (req, user) => {
  req.user = user;
  if (req.session) {
    req.session.user = user;
  }
};

const requireAuth = (req, res, next) => {
  const user = decodeToken(getTokenFromRequest(req));
  if (!user) {
    return res.redirect("/auth/login");
  }

  attachUserToRequest(req, user);
  next();
};

requireAuth.optional = (req, res, next) => {
  const user = decodeToken(getTokenFromRequest(req));
  if (user) {
    attachUserToRequest(req, user);
    res.locals.user = user;
  } else {
    req.user = null;
    if (req.session) req.session.user = null;
    res.locals.user = null;
  }
  next();
};

module.exports = requireAuth;