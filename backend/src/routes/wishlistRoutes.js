// routes/wishlistRoutes.js
import express from "express";
import { authenticateToken } from "../middleware/authorization.js";
import {
  getWishlist,
  clearWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from "../controllers/userController.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get user's wishlist
router.get("/", getWishlist);

// Clear entire wishlist
router.delete("/", clearWishlist);

// Add product to wishlist
router.post("/add", addToWishlist);

// Check if product is in wishlist
router.get("/check/:productId", checkWishlist);

// Remove product from wishlist (must be last to avoid conflicts)
router.delete("/:productId", removeFromWishlist);

export default router;