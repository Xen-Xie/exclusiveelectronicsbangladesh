import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import slugify from "slugify";

// Upload image to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "ExclusiveEB" },
      (error, result) => {
        if (result) {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject(error);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Create Product

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, discountPrice } =
      req.body;

    let images = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer)
      );

      images = await Promise.all(uploadPromises);
    }

    const newProduct = new Product({
      name,
      description,
      price,
      salePrice: discountPrice,
      category,
      stock,
      images: images,
    });

    await newProduct.save();

    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Get Product by ID
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });

    res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// GET PRODUCT BY SLUG

export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product)
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });

    res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Get Products by Category

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Product.find({ category });

    res.status(200).json({
      status: "success",
      results: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { name } = req.body;

    // Update slug if name changed
    if (name) {
      req.body.slug = slugify(name, { lower: true, strict: true });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product)
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });

    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product)
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });

    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};
