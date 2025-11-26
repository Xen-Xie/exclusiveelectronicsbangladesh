import mongoose from "mongoose";

const userBehaviorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "category_view",
        "product_view",
        "product_click",
        "search",
        "add_to_cart",
        "purchase",
      ],
    },
    category: {
      type: String,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    searchTerm: {
      type: String,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
userBehaviorSchema.index({ userId: 1, type: 1, createdAt: -1 });
userBehaviorSchema.index({ userId: 1, category: 1 });
userBehaviorSchema.index({ userId: 1, productId: 1 });

export default mongoose.model("UserBehavior", userBehaviorSchema);
