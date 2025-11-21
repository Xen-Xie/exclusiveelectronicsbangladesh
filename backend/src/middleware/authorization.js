import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to authenticate a user based on JWT token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization; // Get the Authorization header

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. Token missing." }); // Reject if header missing
  }

  const token = authHeader.split(" ")[1]; // Extract token from header

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

    req.user = await User.findById(decoded.id).select("-password"); // Fetch user from DB

    if (!req.user) {
      return res.status(401).json({ message: "User not found." }); // Reject if user no longer exists
    }

    next(); // Proceed to next middleware
  } catch (err) {
    console.error("JWT verification error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please login again." }); // Handle expired token
    }

    return res.status(403).json({ message: "Invalid token." }); // Handle invalid token
  }
};

// Middleware to authorize only admin users
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next(); // Allow access if admin
  }

  return res.status(403).json({ message: "Access denied. Admins only." }); // Deny access if not admin
};
