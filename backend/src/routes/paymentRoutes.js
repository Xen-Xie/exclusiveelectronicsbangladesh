import express from "express";
import { 
  initPayment, 
  sslSuccess, 
  sslFail, 
  sslCancel 
} from "../controllers/sslController.js";

const router = express.Router();

// INIT PAYMENT
// POST /api/payment/init/:orderId
router.post("/init/:orderId", initPayment);

// SSL CALLBACKS (GET or POST both work, but SSLCommerz uses POST)
router.post("/ssl/success/:orderId", sslSuccess);
router.post("/ssl/fail/:orderId", sslFail);
router.post("/ssl/cancel/:orderId", sslCancel);

export default router;
