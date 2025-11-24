import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

/**
 * Business rules summary:
 * - Create order: validate items & totals, DO NOT decrement stock yet.
 * - Mark order paid: atomically decrement stock for items (fail if insufficient).
 * - Cancel order:
 *     - If order was paid -> restore stock atomically.
 *     - If not paid -> simply set status to 'cancelled'.
 * - Update status (admin):
 *     - When transitioning to 'delivered' -> increment product.sold.
 *     - Other transitions handled normally.
 *
 * All stock / sold changes use transactions for atomicity.
 */

// Helper: ensure user is owner or admin
const isOwnerOrAdmin = (order, user) =>
  String(order.user) === String(user._id) || user.role === "admin";

// Create Order
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress = {}, shippingFee = 0 } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ status: "fail", message: "No items in order" });
    }

    // Validate & compute subtotal, build final items array
    let subtotal = 0;
    const finalItems = [];

    for (const item of items) {
      // expect item.product (id) and qty at minimum
      if (!item.product || !item.qty) {
        return res
          .status(400)
          .json({ status: "fail", message: "Invalid item format" });
      }

      const product = await Product.findById(item.product).lean();

      if (!product) {
        return res.status(404).json({
          status: "fail",
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({
          status: "fail",
          message: `${product.name} has only ${product.stock} pcs left`,
        });
      }

      const price =
        product.salePrice !== undefined && product.salePrice !== null
          ? product.salePrice
          : product.price;
      subtotal += price * item.qty;

      finalItems.push({
        product: product._id,
        name: product.name,
        price,
        salePrice: product.salePrice,
        originalPrice: product.price,
        qty: item.qty,
        sku: product.sku || "",
      });
    }

    const total = subtotal + Number(shippingFee || 0);

    const order = await Order.create({
      user: req.user._id,
      items: finalItems,
      shippingAddress,
      subtotal,
      shippingFee: Number(shippingFee || 0),
      total,
      status: "created",
      payment: { method: "manual", status: "pending" },
    });

    return res
      .status(201)
      .json({ status: "success", message: "Order created", data: order });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res
      .status(500)
      .json({ status: "fail", message: "Server error", error: error.message });
  }
};

// Get current user's orders

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({
        createdAt: -1,
      })
      .populate("items.product", "name images price");
    return res.json({
      status: "success",
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get My Orders:", error);
    return res
      .status(500)
      .json({ status: "fail", message: "Server error", error: error.message });
  }
};

// Get order by id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "fullName email"
    );

    if (!order)
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found" });

    if (!isOwnerOrAdmin(order, req.user)) {
      return res.status(403).json({ status: "fail", message: "Access denied" });
    }

    return res.json({ status: "success", data: order });
  } catch (error) {
    console.error("Get Order:", error);
    return res
      .status(500)
      .json({ status: "fail", message: "Server error", error: error.message });
  }
};

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ status: "fail", message: "Admin only" });
    }

    const orders = await Order.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });
    return res.json({
      status: "success",
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get All Orders:", error);
    return res
      .status(500)
      .json({ status: "fail", message: "Server error", error: error.message });
  }
};

// Mark order as paid

export const markOrderPaid = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { transactionId, gatewayResponse, method = "sslcommerz" } = req.body;
    const orderId = req.params.id;

    let order = await Order.findById(orderId);
    if (!order) {
      await session.endSession();
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found" });
    }

    if (!isOwnerOrAdmin(order, req.user)) {
      await session.endSession();
      return res.status(403).json({ status: "fail", message: "Access denied" });
    }

    if (order.payment?.status === "paid") {
      await session.endSession();
      return res
        .status(400)
        .json({ status: "fail", message: "Order already paid" });
    }

    // Start transaction to decrement stock atomically
    let updatedOrder = null;
    await session.withTransaction(async () => {
      // Re-check stock for each item and decrement
      for (const item of order.items) {
        const prod = await Product.findById(item.product).session(session);

        if (!prod) {
          throw new Error(`Product not found: ${item.product}`);
        }

        if (prod.stock < item.qty) {
          throw new Error(
            `Insufficient stock for ${prod.name} (have ${prod.stock}, need ${item.qty})`
          );
        }

        // decrement stock
        prod.stock -= item.qty;

        // update status if stock becomes 0
        if (prod.stock === 0 && prod.status !== "archived") {
          prod.status = "soldout";
        }

        await prod.save({ session });
      }

      // update order payment & status
      order.payment = order.payment || {};
      order.payment.status = "paid";
      order.payment.method = method;
      order.payment.transactionId = transactionId;
      order.payment.gatewayResponse = gatewayResponse;
      order.payment.paidAt = new Date();

      order.status = "paid";
      await order.save({ session });

      updatedOrder = order;
    });

    await session.endSession();
    return res.json({
      status: "success",
      message: "Order marked as paid",
      data: updatedOrder,
    });
  } catch (error) {
    await session.endSession();
    console.error("Mark Paid Error:", error);
    return res.status(400).json({
      status: "fail",
      message: error.message || "Failed to mark paid",
    });
  }
};

// Cancel order

// If paid restore stock atomically and set status to cancelled (and mark payment.refunded maybe)
// If not paid just set cancelled

export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      await session.endSession();
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found" });
    }

    // owner or admin can cancel
    if (!isOwnerOrAdmin(order, req.user)) {
      await session.endSession();
      return res.status(403).json({ status: "fail", message: "Access denied" });
    }

    // If already cancelled
    if (order.status === "cancelled") {
      await session.endSession();
      return res
        .status(400)
        .json({ status: "fail", message: "Order already cancelled" });
    }

    // If paid restore stock atomically
    if (order.payment && order.payment.status === "paid") {
      await session.withTransaction(async () => {
        // restore stock
        for (const item of order.items) {
          const prod = await Product.findById(item.product).session(session);
          if (!prod) throw new Error(`Product not found: ${item.product}`);

          prod.stock += item.qty;

          // if product was soldout and stock > 0, set status back to active (unless archived)
          if (prod.stock > 0 && prod.status === "soldout") {
            prod.status = "active";
          }

          await prod.save({ session });
        }

        // mark order cancelled and optionally note refund needed
        order.status = "cancelled";
        // optionally set payment.status = 'refunded' if need later
        await order.save({ session });
      });

      await session.endSession();
      return res.json({
        status: "success",
        message: "Paid order cancelled and stock restored",
        data: order,
      });
    }

    // If not paid: just cancel
    order.status = "cancelled";
    await order.save();
    await session.endSession();
    return res.json({
      status: "success",
      message: "Order cancelled",
      data: order,
    });
  } catch (error) {
    await session.endSession();
    console.error("Cancel Order Error:", error);
    return res.status(500).json({
      status: "fail",
      message: error.message || "Failed to cancel order",
    });
  }
};

// Update order status

export const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    if (req.user.role !== "admin") {
      await session.endSession();
      return res.status(403).json({ status: "fail", message: "Admin only" });
    }

    const { status } = req.body;
    const allowed = [
      "created",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ];
    if (!allowed.includes(status)) {
      await session.endSession();
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      await session.endSession();
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found" });
    }

    // If trying to set to delivered increment sold counts (atomically)
    if (status === "delivered" && order.status !== "delivered") {
      // atomic increment sold
      await session.withTransaction(async () => {
        for (const item of order.items) {
          const prod = await Product.findById(item.product).session(session);
          if (!prod) throw new Error(`Product not found: ${item.product}`);

          prod.sold = (prod.sold || 0) + item.qty;

          // If stock is 0 and status not archived, keep soldout (no change)
          // Save product
          await prod.save({ session });
        }

        order.status = "delivered";
        order.updatedAt = new Date();
        await order.save({ session });
      });

      await session.endSession();
      return res.json({
        status: "success",
        message: "Order marked delivered and sold counts updated",
        data: order,
      });
    }

    // For other statuses, just update
    order.status = status;
    order.updatedAt = new Date();
    await order.save();
    await session.endSession();
    return res.json({
      status: "success",
      message: "Status updated",
      data: order,
    });
  } catch (error) {
    await session.endSession();
    console.error("Update Status Error:", error);
    return res.status(500).json({
      status: "fail",
      message: error.message || "Failed to update status",
    });
  }
};

// Delete order (admin)

export const deleteOrder = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ status: "fail", message: "Admin only" });
    }

    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found" });

    return res.json({ status: "success", message: "Order deleted" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    return res
      .status(500)
      .json({ status: "fail", message: "Server error", error: error.message });
  }
};
