// routes/reviewRoutes.js
import express from "express";
import {
  canReviewProduct,
  getMyReviewForProduct,
  submitReview,
  getProductReviews,
  getUserReviews,
  getEditHistory,
  markHelpful,
  checkHelpfulStatus,
  deleteReview,
  getRecentReviews,
  getAllReviews,
  toggleFeatured,
} from "../controllers/ReviewController.js";
import { authenticateToken, isAdmin } from "../middleware/authorization.js";
import { upload, dedupFiles } from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);
router.get("/recent", getRecentReviews);

// User routes
router.get("/can-review/:productId", authenticateToken, canReviewProduct);
router.get("/my-review/:productId", authenticateToken, getMyReviewForProduct);
router.get("/my-reviews", authenticateToken, getUserReviews);
router.get("/edit-history/:reviewId", authenticateToken, getEditHistory);
router.get("/helpful-status/:reviewId", authenticateToken, checkHelpfulStatus);

// Single endpoint for both create and update review
router.post(
  "/product/:productId",
  authenticateToken,
  upload.array("reviewImages", 5),
  dedupFiles,
  submitReview
);

router.put("/helpful/:reviewId", authenticateToken, markHelpful);
router.delete("/:reviewId", authenticateToken, deleteReview);

// Admin routes
router.get("/admin/all", authenticateToken, isAdmin, getAllReviews);
router.put(
  "/admin/featured/:reviewId",
  authenticateToken,
  isAdmin,
  toggleFeatured
);

export default router;
