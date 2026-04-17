const admin = (req, res, next) => {
  // We check the role we added to the User model
  // req.user was already populated by our 'protect' middleware
  if (req.user && req.user.role === 'admin') {
    next(); // All good, proceed to the controller
  } else {
    res.status(403).json({ message: "Access denied. Admin rights required." });
  }
};

module.exports = { admin };