import express from "express";
import {
  getAllBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from "../controllers/bannerController.js";
import { authenticateToken, isAdmin } from "../middleware/authorization.js";
import { upload, dedupFiles } from "../middleware/upload.js";

const router = express.Router();

// Public route - get active banners
router.get("/active", getActiveBanners);

// Admin routes
router.get("/", authenticateToken, isAdmin, getAllBanners);
router.post(
  "/",
  authenticateToken,
  isAdmin,
  upload.single("image"),
  dedupFiles,
  createBanner
);
router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  upload.single("image"),
  dedupFiles,
  updateBanner
);
router.delete("/:id", authenticateToken, isAdmin, deleteBanner);
router.patch("/:id/toggle", authenticateToken, isAdmin, toggleBannerStatus);

export default router;
