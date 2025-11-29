import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
    trim: true,
    maxLength: [100, "Title cannot exceed 100 characters"],
    default: "",
  },
  image: {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  link: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  target: {
    type: String,
    enum: ["_self", "_blank", "_parent", "_top"],
    default: "_self",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp before saving
bannerSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find active banners
bannerSchema.statics.findActive = function () {
  const now = new Date();
  return this.find({
    isActive: true,
    $or: [
      { endDate: { $exists: false } },
      { endDate: null },
      { endDate: { $gte: now } },
    ],
  }).sort({ order: 1, createdAt: -1 });
};

export default mongoose.model("Banner", bannerSchema);
