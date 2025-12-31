// models/User.js
import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
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
    },
    googleId: {
      type: String,
      sparse: true, // Important: allows multiple null values
    },
    agreeToTerms: {
      type: Boolean,
      default: false,
    },
    phoneNumber: { type: String },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    // to avoid __v field
    versionKey: false,
  }
);

// Add virtual field to check if user is Google user
userSchema.virtual("isGoogleUser").get(function () {
  return !!this.googleId;
});

// Add isNew property (useful for tracking new users)
userSchema.virtual("isNew").get(function () {
  return Date.now() - this.createdAt < 60000; // Within 1 minute of creation
});

export default mongoose.model("User", userSchema);
