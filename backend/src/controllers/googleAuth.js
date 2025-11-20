import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Continue with Google
export const googleAuth = async (req, res) => {
  try {
    console.log("Google auth endpoint hit");
    const { idToken } = req.body;

    if (!idToken) {
      console.log("No ID token provided");
      return res.status(400).json({
        status: "fail",
        message: "Missing Google ID token",
      });
    }

    // Verify Google token
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
      console.log("Google token verified for:", payload.email);
    } catch (googleError) {
      console.error("Google token verification failed:", googleError);
      return res.status(400).json({
        status: "fail",
        message: "Invalid Google token",
      });
    }

    const { email, name, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email not found in Google token",
      });
    }

    // Check if user already exists
    let user = await User.findOne({
      $or: [{ email }, { googleId }],
    });

    console.log("User lookup result:", user ? "found" : "not found");

    if (!user) {
      // Create new Google user
      user = await User.create({
        name,
        email,
        googleId,
        password: null,
      });
      console.log("New Google user created:", email);
    } else if (!user.googleId) {
      // Update existing user with Google ID
      user.googleId = googleId;
      await user.save();
      console.log("Existing user updated with Google ID:", email);
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      status: "success",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({
      status: "fail",
      message: "Authentication failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
