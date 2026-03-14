const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts"); // ✅ ADD THIS
const cookieParser = require("cookie-parser");
require("dotenv").config();

/* CONFIG */
const connectDB = require("./config/db");
const sessionConfig = require("./config/session");

/* ROUTES */
const authRoutes = require("./routes/auth.routes");
const commonRoutes = require("./routes/common.routes");
const studentRoutes = require("./routes/student.routes");
const ownerRoutes = require("./routes/owner.routes");
const pgRoutes = require("./routes/pg.routes");
const pgRequestRoutes = require("./routes/pgRequest.routes");
const roommateRoutes = require("./routes/roommate.routes");
const reviewRoutes = require("./routes/review.routes");
const chatRoutes = require("./routes/chat.routes");

/* MIDDLEWARE */
const authMiddleware = require("./middleware/auth.middleware");
const roleMiddleware = require("./middleware/role.middleware");

const app = express();

/* DATABASE CONNECTION */
connectDB();

/* VIEW ENGINE */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ✅ EJS LAYOUT SETUP (THIS FIXES THE ERROR) */
app.use(expressLayouts);
app.set("layout", "layouts/main");

/* GLOBAL MIDDLEWARE */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

/* SESSION */
app.use(sessionConfig);

/* OPTIONAL JWT AUTH FOR DYNAMIC NAVBAR */
app.use(authMiddleware.optional);

/* CURRENT ROUTE FOR ACTIVE NAV STYLES */
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

/* ROUTES */

/* Public / Common */
app.use("/", commonRoutes);

/* Authentication */
app.use("/auth", authRoutes);

/* Student (Protected) */
app.use(
  "/student",
  authMiddleware,
  roleMiddleware("student"),
  studentRoutes
);

/* Owner (Protected) */
app.use(
  "/owner",
  authMiddleware,
  roleMiddleware("owner"),
  ownerRoutes
);

/* PG Management (Owner only actions) */
app.use(
  "/pg",
  authMiddleware,
  roleMiddleware("owner"),
  pgRoutes
);

/* PG Requests (student create, owner manage) */
app.use(
  "/requests",
  authMiddleware,
  pgRequestRoutes
);

/* Roommate Finder (Student) */
app.use("/roommate", roommateRoutes);

/* Reviews (Student) */
app.use(
  "/review",
  authMiddleware,
  roleMiddleware("student"),
  reviewRoutes
);

/* Chat (Student & Owner) */
app.use(
  "/chat",
  authMiddleware,
  chatRoutes
);

/* 404 HANDLER */
app.use((req, res) => {
  res.status(404).render("common/404", {
    message: "Page not found",
  });
});

/* SERVER */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`StayMate running on http://localhost:${PORT}`);
});