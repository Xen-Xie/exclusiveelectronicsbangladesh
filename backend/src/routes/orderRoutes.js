import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  markOrderPaid,
  cancelOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/OrderController.js";

import {
  initPayment,
  sslSuccess,
  sslFail,
  sslCancel,
} from "../controllers/sslController.js";

import { authenticateToken, isAdmin } from "../middleware/authorization.js";

const router = express.Router();

// ORDER ROUTES
router.post("/", authenticateToken, createOrder);

router.get("/my", authenticateToken, getMyOrders);
router.get("/:id", authenticateToken, getOrderById);

router.get("/", authenticateToken, isAdmin, getAllOrders);

router.put("/:id/pay", authenticateToken, markOrderPaid);
router.put("/:id/cancel", authenticateToken, cancelOrder);

router.put("/:id/status", authenticateToken, isAdmin, updateOrderStatus);

router.delete("/:id", authenticateToken, isAdmin, deleteOrder);

// SSL PAYMENT ROUTES
router.get("/payment/ssl/:orderId", authenticateToken, initPayment);

router.post("/payment/ssl/success/:orderId", sslSuccess);
router.post("/payment/ssl/fail/:orderId", sslFail);
router.post("/payment/ssl/cancel/:orderId", sslCancel);

export default router;
