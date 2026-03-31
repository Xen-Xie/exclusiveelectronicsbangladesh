import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Product from "../models/Product.js";

// Create User
export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      address,
      googleId,
      agreeToTerms,
      firebaseUid, // Add this
      emailVerified, // Add this
    } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email, and password are required",
      });
    }

    // Check terms agreement
    if (agreeToTerms === false || agreeToTerms === undefined) {
      return res.status(400).json({
        status: "fail",
        message: "You must agree to the Terms & Conditions",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Email already exists. Please use a different email or login.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with ALL required fields
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      agreeToTerms: agreeToTerms || false, // Ensure this is saved
      phoneNumber: phoneNumber || "",
      address: address || "",
      role: "user",
      firebaseUid: firebaseUid || null,
      emailVerified: emailVerified || false,
    });

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      status: "success",
      message: "Account created successfully!",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
        agreeToTerms: user.agreeToTerms,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);

    // Handle duplicate key error (email already exists)
    if (error.code === 11000) {
      return res.status(400).json({
        status: "fail",
        message: "Email already exists. Please use a different email.",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: "fail",
        message: messages.join(", "),
      });
    }

    // Generic error
    res.status(500).json({
      status: "fail",
      message: "Registration failed. Please try again.",
    });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    // Check if user has a password (Google users might not)
    if (!user.password) {
      return res.status(401).json({
        status: "fail",
        message: "Please use Google login for this account",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }
    if (!user.emailVerified) {
      return res.status(403).json({
        status: "fail",
        message:
          "Please verify your email address before logging in. Check your inbox for the verification link.",
      });
    }
    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
        agreeToTerms: user.agreeToTerms,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    // Specific error for bcrypt issues
    if (
      error.message.includes("Illegal arguments") ||
      error.message.includes("data and salt arguments required")
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Password comparison failed. Please try again.",
      });
    }

    res.status(500).json({
      status: "fail",
      message: "Login failed. Please try again.",
    });
  }
};

// Get all users (exclude password)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ status: "success", data: users });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Get single user (exclude password)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Filter out inactive products from wishlist if wishlist exists
    let activeWishlist = [];
    if (user.wishlist && user.wishlist.length > 0) {
      // You need to populate product details first
      await user.populate({
        path: "wishlist.product",
        select: "name price salePrice onSale images slug ratingSummary status",
      });

      activeWishlist = user.wishlist.filter(
        (item) => item.product && item.product.status === "active",
      );
    }

    const userResponse = user.toObject();
    userResponse.wishlist = activeWishlist;

    // Send response only once
    return res.status(200).json({
      status: "success",
      data: userResponse,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Update user info (only phoneNumber and address)
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      phoneNumber,
      address,
      postalCode,
      division,
      district,
      upazila,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        phoneNumber,
        address,
        postalCode,
        division,
        district,
        upazila,
      },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser)
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });

    res.status(200).json({
      status: "success",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};
// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });

    res.status(200).json({ status: "success", message: "User deleted" });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// Toggle role
export const toggleUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });

    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();

    res.status(200).json({ status: "success", data: user });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    // Check if product is active
    if (product.status !== "active") {
      return res.status(400).json({
        status: "fail",
        message: "Product is not available",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Check if product already in wishlist
    const alreadyInWishlist = user.wishlist.some(
      (item) => item.product.toString() === productId,
    );

    if (alreadyInWishlist) {
      return res.status(400).json({
        status: "fail",
        message: "Product already in wishlist",
      });
    }

    // Add to wishlist
    user.wishlist.push({
      product: productId,
      addedAt: new Date(),
    });

    await user.save();

    // Populate product details for response
    await user.populate("wishlist.product");

    res.status(200).json({
      status: "success",
      message: "Product added to wishlist",
      data: {
        wishlist: user.wishlist,
        wishlistCount: user.wishlist.length,
      },
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Remove from wishlist
    user.wishlist = user.wishlist.filter(
      (item) => item.product.toString() !== productId,
    );

    await user.save();

    // Populate product details for response
    await user.populate("wishlist.product");

    res.status(200).json({
      status: "success",
      message: "Product removed from wishlist",
      data: {
        wishlist: user.wishlist,
        wishlistCount: user.wishlist.length,
      },
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: "wishlist.product",
      select:
        "name price salePrice onSale images slug ratingSummary status stock",
    });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Filter out products that are no longer active or out of stock
    const activeWishlist = user.wishlist.filter(
      (item) => item.product && item.product.status === "active",
    );

    res.status(200).json({
      status: "success",
      results: activeWishlist.length,
      data: {
        wishlist: activeWishlist,
        wishlistCount: activeWishlist.length,
      },
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Check if product is in wishlist
export const checkWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const isInWishlist = user.wishlist.some(
      (item) => item.product.toString() === productId,
    );

    res.status(200).json({
      status: "success",
      data: {
        isInWishlist,
      },
    });
  } catch (error) {
    console.error("Check wishlist error:", error);
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Clear entire wishlist
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    user.wishlist = [];
    await user.save();

    res.status(200).json({
      status: "scityuccess",
      message: "Wishlist cleared successfully",
      data: {
        wishlist: [],
        wishlistCount: 0,
      },
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Add email verification endpoint
export const verifyEmail = async (req, res) => {
  try {
    const { email, firebaseUid } = req.body;

    if (!email && !firebaseUid) {
      return res.status(400).json({
        status: "fail",
        message: "Email or Firebase UID is required",
      });
    }

    const user = await User.findOne({
      $or: [{ email: email?.toLowerCase() }, { firebaseUid }],
    });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        status: "fail",
        message: "Email already verified",
      });
    }

    // Update email verification status
    user.emailVerified = true;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Email verified successfully! You can now login.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Resend verification email (optional)
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        status: "fail",
        message: "Email already verified",
      });
    }

    // Here you would trigger Firebase to resend verification email
    // Since you're using Firebase, you'll need to handle this on the frontend

    res.status(200).json({
      status: "success",
      message: "Verification email resent. Please check your inbox.",
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Send password reset email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email is required",
      });
    }

    // Check if user exists in MongoDB
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No account found with this email address",
      });
    }

    // Check if user is Google user (no password)
    if (user.googleId) {
      return res.status(400).json({
        status: "fail",
        message: "This account uses Google Sign-In. Please login with Google.",
      });
    }

    // Check if user is verified
    if (!user.emailVerified) {
      return res.status(400).json({
        status: "fail",
        message:
          "Please verify your email address first. Check your inbox for verification link.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User found. Password reset email will be sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
