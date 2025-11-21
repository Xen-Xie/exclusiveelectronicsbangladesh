import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Continue with Google
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res
        .status(400)
        .json({ status: "fail", message: "Missing ID token" });
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, sub: googleId } = payload;

    if (!email)
      return res
        .status(400)
        .json({ status: "fail", message: "Email missing from Google" });

    // Find existing user (email or googleId)
    let user = await User.findOne({
      $or: [{ email }, { googleId }],
    });

    if (!user) {
      // Create new Google-only user
      user = await User.create({
        name,
        email,
        googleId,
        password: null,
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
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
    return res.status(500).json({
      status: "fail",
      message: "Google authentication failed",
    });
  }
};
