import express from "express";
import {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
} from "../controllers/userController.js";

const router = express.Router();

// Manual signup
router.post("/signup", createUser);

// Manual login
router.post("/login", loginUser);

// Get all users
router.get("/", getAllUsers);

// Get single user by ID
router.get("/:id", getUserById);

export default router;
