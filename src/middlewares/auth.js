const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

/**
 * Authentication middleware
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Generate JWT token
 */
exports.generateToken = (payload) => {
  const { jwtSecret, jwtExpire } = require("../config/env");
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpire });
};

/**
 * Verify password
 */
exports.verifyPassword = async (plainPassword, hashedPassword) => {
  const bcrypt = require("bcryptjs");
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Authorization middleware: allow only specified roles
 */
exports.authorizeRoles = (...allowed) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res
          .status(401)
          .json({ success: false, message: "Authentication required" });
      }
      if (!allowed.includes(req.user.role)) {
        return res
          .status(403)
          .json({ success: false, message: "Forbidden: insufficient role" });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
