import express from "express";
import {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserRole,
} from "../controllers/userController.js";
import { googleAuth } from "../controllers/googleAuth.js";
import { authenticateToken, isAdmin } from "../middleware/authorization.js";
const router = express.Router();

// Manual signup
router.post("/signup", createUser);

// Manual login
router.post("/login", loginUser);
router.put("/update", authenticateToken, updateUser);

// Google OAuth login/signup
router.post("/google", googleAuth);

// Get all users
router.get("/", authenticateToken, isAdmin, getAllUsers);

// Get single user by ID
router.get("/:id", getUserById);
router.delete("/:id", authenticateToken, isAdmin, deleteUser);
router.patch("/toggle-role/:id", authenticateToken, isAdmin, toggleUserRole);
export default router;
