import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
    });

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
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
      "+password"
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

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
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
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });

    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Update user info (only phoneNumber and address)
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phoneNumber, address, city, postalCode } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        phoneNumber,
        address,
        city,
        postalCode,
      },
      { new: true, runValidators: true }
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
