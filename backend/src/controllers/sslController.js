// src/controllers/sslController.js
import pkg from "sslcommerz-lts";
import Order from "../models/Order.js";
import sslconfig from "../config/sslcommerz.js";
import Product from "../models/Product.js";

// handle CJS export interop safely
const SSLCommerzPayment = pkg && (pkg.default || pkg);

// Helper Function
const getFrontendUrl = (path) => {
  const baseUrl = process.env.FRONTEND_URL;
  if (!baseUrl) {
    // Log only in development
    if (process.env.NODE_ENV !== "production") {
      console.error("FRONTEND_URL environment variable is not set");
    }
    return "/"; // fallback
  }
  // Ensure path starts with slash and baseUrl doesn't end with one
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBase}${normalizedPath}`;
};

// Initial Payment
export const initPayment = async (req, res) => {
  try {
    if (!SSLCommerzPayment) {
      return res.status(500).json({
        status: "fail",
        message: "Payment service temporarily unavailable",
      });
    }

    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({
        status: "fail",
        message: "Order reference is required",
      });
    }

    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found",
      });
    }

    if (order.payment?.status === "paid") {
      return res.status(400).json({
        status: "fail",
        message: "This order has already been paid",
      });
    }

    const total = Number(order.total || 0);
    if (!total || total <= 0) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid order amount",
      });
    }

    const shipping = order.shippingAddress || {};
    const user = order.user || {};

    const data = {
      store_id: sslconfig.store_id,
      store_passwd: sslconfig.store_passwd,
      total_amount: total,
      currency: "BDT",
      tran_id: `TXN_${orderId}_${Date.now()}`,
      success_url: `${process.env.BACKEND_URL}/api/payment/ssl/success/${orderId}`,
      fail_url: `${process.env.BACKEND_URL}/api/payment/ssl/fail/${orderId}`,
      cancel_url: `${process.env.BACKEND_URL}/api/payment/ssl/cancel/${orderId}`,

      product_name: order.items?.[0]?.name || "Order Payment",
      product_category: "Ecommerce",
      product_profile: "general",
      shipping_method: "Courier",
      num_of_item: order.items?.length || 1,

      // Customer info
      cus_name: shipping.fullName || user.fullName || "Customer",
      cus_email: user.email || "",
      cus_add1: shipping.addressLine || "",
      cus_city: shipping.city || "",
      cus_postcode: shipping.postalCode || "",
      cus_country: shipping.country || "",
      cus_phone: shipping.phone || "",

      // REQUIRED BY SSLCommerz
      ship_name: shipping.fullName || user.fullName || "Customer",
      ship_add1: shipping.addressLine || shipping.city || "Address",
      ship_city: shipping.city || "Dhaka",
      ship_postcode: shipping.postalCode || "0000",
      ship_country: shipping.country || "Bangladesh",
    };

    const sslcommerz = new SSLCommerzPayment(
      sslconfig.store_id,
      sslconfig.store_passwd,
      sslconfig.sandbox,
    );

    const response = await sslcommerz.init(data);

    if (!response) {
      return res.status(500).json({
        status: "fail",
        message: "Payment gateway is not responding",
      });
    }

    if (response.status && String(response.status).toUpperCase() === "FAILED") {
      return res.status(400).json({
        status: "fail",
        message: "Unable to initialize payment",
        detail: response.failedreason || "Payment initialization failed",
      });
    }

    if (response.GatewayPageURL) {
      return res.json({
        status: "success",
        url: response.GatewayPageURL,
      });
    }

    return res.status(400).json({
      status: "fail",
      message: "Payment session creation failed",
    });
  } catch (error) {
    // Log error for monitoring (you can replace with your logging service)
    if (process.env.NODE_ENV === "production") {
      // Here you can integrate with your logging service
      logger.error("Payment initialization error", {
        error: error.message,
        orderId: req.params.orderId,
      });
    }

    return res.status(500).json({
      status: "fail",
      message: "An unexpected error occurred",
    });
  }
};

// Success callBack Function
export const sslSuccess = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.redirect(
        getFrontendUrl("/payment-failed?error=invalid_request"),
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.redirect(
        getFrontendUrl("/payment-failed?error=order_not_found"),
      );
    }

    // Prevent duplicate payment processing
    if (order.payment?.status === "paid") {
      return res.redirect(getFrontendUrl(`/payment-success?order=${orderId}`));
    }

    // Update order status (DO NOT reduce stock - already reduced at order creation)
    order.payment = {
      method: "sslcommerz",
      status: "paid",
      transactionId: req.body.tran_id || req.body.bank_tran_id || "",
      gatewayResponse: req.body,
      paidAt: new Date(),
    };
    order.status = "paid";

    // Update sold count (stock was already reduced when order was created)
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.sold = (product.sold || 0) + item.qty;
        await product.save();
      }
    }

    await order.save();

    return res.redirect(getFrontendUrl(`/payment-success?order=${orderId}`));
  } catch (error) {
    console.error("Payment success callback error:", error);
    return res.redirect(
      getFrontendUrl("/payment-failed?error=processing_error"),
    );
  }
};

// Payment Fail CallBack Function
export const sslFail = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        "payment.status": "failed",
        status: "created",
        "payment.gatewayResponse": req.body,
        "payment.failedAt": new Date(),
      });
    }

    return res.redirect(
      getFrontendUrl(`/payment-failed?order=${orderId || ""}`),
    );
  } catch (error) {
    // Log error for monitoring
    if (process.env.NODE_ENV === "production") {
      logger.error("Payment fail callback error", {
        error: error.message,
        orderId: req.params.orderId,
      });
    }

    return res.redirect(getFrontendUrl("/payment-failed"));
  }
};

// Cancel Callback
export const sslCancel = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        "payment.status": "cancelled",
        status: "created",
        "payment.cancelledAt": new Date(),
      });
    }

    return res.redirect(
      getFrontendUrl(`/payment-cancelled?order=${orderId || ""}`),
    );
  } catch (error) {
    // Log error for monitoring
    if (process.env.NODE_ENV === "production") {
      logger.error("Payment cancel callback error", {
        error: error.message,
        orderId: req.params.orderId,
      });
    }

    return res.redirect(getFrontendUrl("/payment-cancelled"));
  }
};
