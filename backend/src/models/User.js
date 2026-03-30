import mongoose from "mongoose";
import { Schema } from "mongoose";

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    firebaseUid: {
      type: String,
      sparse: true,
      unique: false,
    },
    verificationToken: {
      type: String,
      sparse: true,
    },
    verificationTokenExpires: {
      type: Date,
    },
    password: {
      type: String,
      // Only validate password for non-Google users
      validate: {
        validator: function (v) {
          // If user has googleId, password is optional
          if (this.googleId) return true;
          // If no googleId, password must be at least 6 chars
          return v && v.length >= 6;
        },
        message: "Password must be at least 6 characters for non-Google users",
      },
      // Don't include password in query results by default
      select: false,
    },
    googleId: {
      type: String,
      default: undefined,
      sparse: true, // Important: allows multiple null values
      index: {
        sparse: true,
        unique: false, // Explicitly set unique to false
      },
    },
    agreeToTerms: {
      type: Boolean,
      default: false,
      required: [true, "Terms agreement is required"],
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
      maxlength: [255, "Address cannot exceed 255 characters"],
    },
    city: {
      type: String,
      trim: true,
      default: "",
      maxlength: [100, "City cannot exceed 100 characters"],
    },
    postalCode: {
      type: String,
      trim: true,
      default: "",
      maxlength: [20, "Postal code cannot exceed 20 characters"],
    },
    division: {
      type: String,
      trim: true,
      default: "",
    },
    district: {
      type: String,
      trim: true,
      default: "",
    },
    upazila: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    wishlist: [wishlistItemSchema],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remove sensitive fields
        delete ret.password;
        delete ret.googleId;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remove sensitive fields
        delete ret.password;
        delete ret.googleId;
        return ret;
      },
    },
  },
);

// Add virtual field to check if user is Google user
userSchema.virtual("isGoogleUser").get(function () {
  return !!this.googleId;
});

// Add isNew property (based on createdAt)
userSchema.virtual("isNew").get(function () {
  return Date.now() - this.createdAt < 24 * 60 * 60 * 1000; // Within 24 hours of creation
});

// Update lastLogin on login
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = Date.now();
  await this.save({ validateBeforeSave: false });
};

// Pre-save middleware to ensure terms agreement for Google users
userSchema.pre("save", function (next) {
  if (this.googleId && !this.agreeToTerms) {
    this.agreeToTerms = true; // Auto-agree for Google users
  }
  next();
});

// Create compound index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });

export default mongoose.model("User", userSchema);
