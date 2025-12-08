// models/Review.js
import mongoose from "mongoose";
import { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxLength: [1000, "Review cannot exceed 1000 characters"],
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
    helpfulUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    helpfulCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Track edit history
    editHistory: [
      {
        rating: Number,
        comment: String,
        images: [
          {
            url: String,
            public_id: String,
          },
        ],
        editedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    editCount: {
      type: Number,
      default: 0,
    },
    lastEditedAt: Date,
  },
  {
    timestamps: true,
  }
);

reviewSchema.pre("save", function (next) {
  // Update helpfulCount based on helpfulUsers array length
  this.helpfulCount = this.helpfulUsers.length;
  next();
});
// Prevent duplicate reviews for same product by same user
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Add index for better query performance
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ product: 1, rating: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ helpfulUsers: 1 });

// Virtual for formatted date
reviewSchema.virtual("formattedDate").get(function () {
  return new Date(this.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for last edit date
reviewSchema.virtual("formattedLastEditDate").get(function () {
  if (!this.lastEditedAt) return null;
  return new Date(this.lastEditedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Method to check if review has been edited
reviewSchema.virtual("isEdited").get(function () {
  return this.editCount > 0;
});

// Middleware to save edit history before updating
reviewSchema.pre("save", function (next) {
  if (
    this.isModified("rating") ||
    this.isModified("comment") ||
    this.isModified("images")
  ) {
    // Don't track on initial creation
    if (!this.isNew) {
      // Save current state to edit history
      this.editHistory.push({
        rating: this.rating,
        comment: this.comment,
        images: [...this.images],
        editedAt: new Date(),
      });

      this.editCount += 1;
      this.lastEditedAt = new Date();

      // Keep only last 5 edits to prevent bloating
      if (this.editHistory.length > 5) {
        this.editHistory = this.editHistory.slice(-5);
      }
    }
  }
  next();
});

reviewSchema.set("toJSON", { virtuals: true });
reviewSchema.set("toObject", { virtuals: true });

export default mongoose.model("Review", reviewSchema);
