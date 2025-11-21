import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      match: [/^.{6,}$/, "Password must be at least 6 characters"],
    },
    googleId: { type: String, default: null },
    phoneNumber: { type: String },
    address: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
