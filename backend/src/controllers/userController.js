import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Create User
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, address, googleId } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ status: "fail", message: "Email already exists" });

    // Hash password only if not Google user
    let hashedPassword;
    if (!googleId) {
      if (!password)
        return res
          .status(400)
          .json({ status: "fail", message: "Password is required" });
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Build user object dynamically
    const userData = {
      name,
      email,
      phoneNumber,
      address,
      ...(googleId && { googleId }),
      ...(hashedPassword && { password: hashedPassword }),
    };

    const user = await User.create(userData);

    res.status(201).json({
      status: "success",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        status: "fail",
        message: `Duplicate field value entered: ${
          Object.keys(error.keyValue)[0]
        }`,
      });
    }
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid credentials" });

    // Create token
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
        phoneNumber: user.phoneNumber,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
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
