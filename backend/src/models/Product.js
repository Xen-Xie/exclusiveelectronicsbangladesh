import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    maxLength: [100, "Product name cannot exceed 100 characters"],
    index: true,
  },
  slug: {
    type: String,
    unique: true,
    index: true,
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    index: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    maxLength: [2000, "Description cannot exceed 2000 characters"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  salePrice: {
    type: Number,
    min: [0, "Sale price cannot be negative"],
    validate: {
      validator: function (value) {
        return value <= this.price;
      },
      message: "Sale price cannot be higher than regular price",
    },
  },
  onSale: {
    type: Boolean,
    default: false,
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, "Stock cannot be negative"],
  },
  sold: {
    type: Number,
    default: 0,
    min: [0, "Sold count cannot be negative"],
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
  ],
  status: {
    type: String,
    enum: ["active", "soldout", "archived"],
    default: "active",
  },
  attributes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  featured: {
    type: Boolean,
    default: false,
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  ratingSummary: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
  },
  quickInfo: {
    freeShipping: {
      type: Boolean,
      default: true,
    },
    returnPolicy: {
      type: String,
      enum: ["30-day", "7-day", "14-day", "non-returnable"],
      default: "30-day",
    },
    support: {
      type: String,
      enum: ["24/7", "business-hours", "email-only"],
      default: "24/7",
    },
    deliveryTime: {
      type: String,
      default: "3-5 business days",
    },
    warranty: {
      type: String,
      default: "1 year",
    },
  },
});

// Pre-save middleware to update timestamps and handle slug/sale logic
productSchema.pre("save", async function (next) {
  this.updatedAt = Date.now();

  // Generate basic slug
  if (!this.slug && this.name) {
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    let finalSlug = baseSlug;
    let counter = 1;

    // Check if slug exists, if yes append -1, -2, -3...
    while (await this.constructor.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = finalSlug;
  }

  // Auto-set onSale based on salePrice
  if (this.salePrice && this.salePrice < this.price) {
    this.onSale = true;
  } else {
    this.onSale = false;
  }

  // Auto-update status based on stock
  if (this.stock === 0 && this.status !== "archived") {
    this.status = "soldout";
  }

  next();
});

// Static method to find active products
productSchema.statics.findActive = function () {
  return this.find({ status: "active" });
};

// Instance method to check availability
productSchema.methods.isAvailable = function () {
  return this.status === "active" && this.stock > 0;
};

// Virtual for current price
productSchema.virtual("currentPrice").get(function () {
  return this.onSale && this.salePrice ? this.salePrice : this.price;
});

// Ensure virtual fields are serialized
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export default mongoose.model("Product", productSchema);
