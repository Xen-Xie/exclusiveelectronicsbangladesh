import express from "express";
import {
  trackBehavior,
  getRecommendations,
  getUserAnalytics,
} from "../controllers/behaviorController.js";
import { authenticateToken, isAdmin } from "../middleware/authorization.js";

const router = express.Router();
router.post("/track", authenticateToken, trackBehavior);
router.get("/recommendations", authenticateToken, getRecommendations);
router.get("/analytics/:userId", authenticateToken, isAdmin, getUserAnalytics);

export default router;
