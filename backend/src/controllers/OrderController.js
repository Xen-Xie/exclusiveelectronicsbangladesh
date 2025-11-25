import Order from "../models/Order.js";
import Product from "../models/Product.js";

/**
 * Business rules summary:
 * - Create order: validate items & totals, DO NOT decrement stock yet.
 * - Mark order paid: decrement stock for items (fail if insufficient).
 * - Cancel order:
 *     - If order was paid -> restore stock.
 *     - If not paid -> simply set status to 'cancelled'.
 * - Update status (admin):
 *     - When transitioning to 'delivered' -> increment product.sold.
 *     - Other transitions handled normally.
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
  try {
    const { transactionId, gatewayResponse, method = "manual" } = req.body;
    const orderId = req.params.id;

    let order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found" });
    }

    if (!isOwnerOrAdmin(order, req.user)) {
      return res.status(403).json({ status: "fail", message: "Access denied" });
    }

    if (order.payment?.status === "paid") {
      return res
        .status(400)
        .json({ status: "fail", message: "Order already paid" });
    }

    // Decrement stock for each item
    for (const item of order.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          status: "fail",
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({
          status: "fail",
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.qty}`,
        });
      }

      // Decrement stock
      product.stock -= item.qty;

      // Update status if stock becomes 0
      if (product.stock === 0 && product.status !== "archived") {
        product.status = "soldout";
      }

      await product.save();
    }

    // Update order payment & status
    order.payment = order.payment || {};
    order.payment.status = "paid";
    order.payment.method = method;
    order.payment.transactionId = transactionId;
    order.payment.gatewayResponse = gatewayResponse;
    order.payment.paidAt = new Date();
    order.status = "paid";

    await order.save();

    return res.json({
      status: "success",
      message: "Order marked as paid and stock updated",
      data: order,
    });
  } catch (error) {
    console.error("Mark Paid Error:", error);
    return res.status(500).json({
      status: "fail",
      message: error.message || "Failed to mark order as paid",
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found" });
    }

    // owner or admin can cancel
    if (!isOwnerOrAdmin(order, req.user)) {
      return res.status(403).json({ status: "fail", message: "Access denied" });
    }

    // If already cancelled
    if (order.status === "cancelled") {
      return res
        .status(400)
        .json({ status: "fail", message: "Order already cancelled" });
    }

    // If paid, restore stock
    if (order.payment && order.payment.status === "paid") {
      // Restore stock for each item
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product) {
          console.error(
            `Product not found during cancellation: ${item.product}`
          );
          continue;
        }

        // Restore stock
        product.stock += item.qty;

        // If product was soldout and stock > 0, set status back to active
        if (product.stock > 0 && product.status === "soldout") {
          product.status = "active";
        }

        await product.save();
      }

      order.status = "cancelled";
      await order.save();

      return res.json({
        status: "success",
        message: "Paid order cancelled and stock restored",
        data: order,
      });
    }

    // If not paid: just cancel
    order.status = "cancelled";
    await order.save();

    return res.json({
      status: "success",
      message: "Order cancelled",
      data: order,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return res.status(500).json({
      status: "fail",
      message: error.message || "Failed to cancel order",
    });
  }
};

// Update order status

export const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
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
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ status: "fail", message: "Order not found" });
    }

    // If trying to set to delivered, increment sold counts
    if (status === "delivered" && order.status !== "delivered") {
      // Increment sold counts for each item
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product) {
          console.error(`Product not found: ${item.product}`);
          continue;
        }

        product.sold = (product.sold || 0) + item.qty;
        await product.save();
      }

      order.status = "delivered";
      order.updatedAt = new Date();
      await order.save();

      return res.json({
        status: "success",
        message: "Order marked delivered and sold counts updated",
        data: order,
      });
    }

    // Handle returned status - restore stock if order was previously delivered
    if (status === "returned" && order.status === "delivered") {
      // Restore stock for returned items
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product) {
          console.error(`Product not found during return: ${item.product}`);
          continue;
        }

        // Restore stock
        product.stock += item.qty;

        // Decrement sold count since product is returned
        product.sold = Math.max(0, (product.sold || 0) - item.qty);

        // Update status if needed
        if (product.stock > 0 && product.status === "soldout") {
          product.status = "active";
        }

        await product.save();
      }

      order.status = "returned";
      order.updatedAt = new Date();
      await order.save();

      return res.json({
        status: "success",
        message: "Order returned and stock restored",
        data: order,
      });
    }

    // For other statuses, just update
    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    return res.json({
      status: "success",
      message: "Status updated",
      data: order,
    });
  } catch (error) {
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

// Get orders with time period filter
export const getOrdersByPeriod = async (req, res) => {
  try {
    const { period, date, startDate, endDate } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (period && date) {
      switch (period) {
        case "today": {
          const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          const end = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59
          );
          dateFilter = { createdAt: { $gte: start, $lte: end } };
          break;
        }

        case "week": {
          const selectedDate = new Date(date);
          const dayOfWeek = selectedDate.getDay();
          const start = new Date(selectedDate);
          start.setDate(selectedDate.getDate() - dayOfWeek);
          start.setHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          dateFilter = { createdAt: { $gte: start, $lte: end } };
          break;
        }

        case "month": {
          const [year, month] = date.split("-");
          const start = new Date(year, month - 1, 1);
          const end = new Date(year, month, 0, 23, 59, 59);
          dateFilter = { createdAt: { $gte: start, $lte: end } };
          break;
        }

        case "year": {
          const start = new Date(date, 0, 1);
          const end = new Date(date, 11, 31, 23, 59, 59);
          dateFilter = { createdAt: { $gte: start, $lte: end } };
          break;
        }

        default:
          break;
      }
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: start, $lte: end } };
    }

    let query = {};

    // If user is not admin, only show their orders
    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }

    // Add date filter if provided
    if (Object.keys(dateFilter).length > 0) {
      query = { ...query, ...dateFilter };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("items.product", "name images price");

    return res.json({
      status: "success",
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get Orders By Period Error:", error);
    return res.status(500).json({
      status: "fail",
      message: "Server error",
      error: error.message,
    });
  }
};
