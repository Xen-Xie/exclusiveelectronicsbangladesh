import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, min: 1, required: true },
  sku: String,
});

const paymentSchema = new mongoose.Schema({
  method: String, // sslcommerz, manual
  status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded","cash_on_delivery"],
    default: "pending",
  },
  transactionId: String,
  gatewayResponse: Object,
  paidAt: Date,
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [orderItemSchema],

    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine: String,
      city: String,
      postalCode: String,
      country: String,
    },

    subtotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    status: {
      type: String,
      enum: [
        "created",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "created",
    },

    payment: paymentSchema,

    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
