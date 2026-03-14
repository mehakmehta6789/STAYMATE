/**
 * Role-based Access Control Middleware
 * Usage: role("student") or role("owner")
 */
module.exports = (requiredRole) => {
  return (req, res, next) => {
    const activeUser = req.user || (req.session && req.session.user);

    if (!activeUser) {
      return res.redirect("/auth/login");
    }

    if (activeUser.role !== requiredRole) {
      return res.status(403).send("Access Denied");
    }

    req.user = activeUser;
    next();
  };
};