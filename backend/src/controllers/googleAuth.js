// controllers/googleAuth.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Google/Firebase Auth - Simplified version
export const googleAuth = async (req, res) => {
  try {
    // Accept data from Firebase-authenticated user
    const { uid, email, name, agreeToTerms } = req.body;

    console.log("Google auth request:", { uid, email, name, agreeToTerms });

    // Basic validation
    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email is required",
      });
    }

    if (!uid) {
      return res.status(400).json({
        status: "fail",
        message: "User ID is required",
      });
    }

    // Find user by email OR googleId (uid)
    let user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { googleId: uid }],
    });

    // User doesn't exist - create new
    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        googleId: uid,
        agreeToTerms: agreeToTerms || false,
        role: "user",
      });
      console.log("New user created:", user.email);
    } else {
      // User exists - update Google ID if missing
      if (uid && !user.googleId) {
        user.googleId = uid;
      }

      // Update name if empty
      if (!user.name && name) {
        user.name = name;
      }

      // Update terms agreement
      if (agreeToTerms !== undefined) {
        user.agreeToTerms = agreeToTerms;
      }

      await user.save();
      console.log("Existing user updated:", user.email);
    }

    // Generate JWT token for your app
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        isGoogleUser: true,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      status: "success",
      message: user.isNew ? "User created successfully" : "Login successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isGoogleUser: true,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        status: "fail",
        message: "Email already exists with different account",
      });
    }

    res.status(500).json({
      status: "fail",
      message: "Authentication failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
