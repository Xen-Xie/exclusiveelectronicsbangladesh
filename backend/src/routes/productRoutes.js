import express from "express";
import {
  getAllProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} from "../controllers/ProductController.js";
import { upload, dedupFiles } from "../middleware/upload.js";
import { authenticateToken, isAdmin } from "../middleware/authorization.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProduct);

// Admin routes (you can add authentication middleware later)
router.post(
  "/",
  authenticateToken,
  isAdmin,
  upload.array("images"),
  dedupFiles,
  createProduct
);

router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  upload.array("images"),
  dedupFiles,
  updateProduct
);
router.delete("/:id", authenticateToken, isAdmin, deleteProduct);

export default router;
