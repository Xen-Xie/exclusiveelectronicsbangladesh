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
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Create Product

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      discountPrice,
      sku,
      tags,
      featured,
      onSale,
      quickInfo,
      shippingInsideDhaka,
      shippingOutsideDhaka,
    } = req.body;
    let parsedQuickInfo = {};
    if (quickInfo) {
      try {
        parsedQuickInfo =
          typeof quickInfo === "string" ? JSON.parse(quickInfo) : quickInfo;
      } catch (e) {
        console.error("Failed to parse quickInfo:", e);
        parsedQuickInfo = {};
      }
    }
    let images = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer),
      );

      images = await Promise.all(uploadPromises);
    }

    // tags parsing
    let parsedTags = [];
    if (tags) {
      if (typeof tags === "string") {
        parsedTags = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    const newProduct = new Product({
      name,
      description,
      price,
      salePrice: discountPrice,
      category,
      stock,
      sku: sku || undefined,
      tags: parsedTags,
      featured: featured === "true" || featured === true,
      onSale: onSale === "true" || onSale === true,
      images: images,
      quickInfo: parsedQuickInfo,
      shippingInsideDhaka:
        shippingInsideDhaka !== undefined ? parseFloat(shippingInsideDhaka) : 0,
      shippingOutsideDhaka:
        shippingOutsideDhaka !== undefined
          ? parseFloat(shippingOutsideDhaka)
          : 60,
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
    const {
      name,
      discountPrice,
      price,
      description,
      category,
      stock,
      sku,
      tags,
      featured,
      onSale,
      quickInfo,
      shippingInsideDhaka,
      shippingOutsideDhaka,
    } = req.body;

    // Get the current product
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    // Build update data carefully - DO NOT use req.body directly
    const updateData = {};

    // Handle each field individually
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true, strict: true });
    }
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (sku !== undefined) updateData.sku = sku;
    if (featured !== undefined)
      updateData.featured = featured === "true" || featured === true;

    // Handle salePrice validation MANUALLY to avoid MongoDB validation
    const currentPrice = updateData.price || currentProduct.price;

    if (discountPrice !== undefined) {
      if (discountPrice && discountPrice !== "" && !isNaN(discountPrice)) {
        const salePriceValue = parseFloat(discountPrice);
        if (salePriceValue <= currentPrice) {
          updateData.salePrice = salePriceValue;
          updateData.onSale = true;
        } else {
          // If invalid, clear salePrice and turn off onSale
          updateData.salePrice = null;
          updateData.onSale = false;
        }
      } else {
        // Clear sale price if empty or invalid
        updateData.salePrice = null;
        updateData.onSale = false;
      }
    }

    // Handle onSale if not set by salePrice logic
    if (onSale !== undefined && updateData.onSale === undefined) {
      updateData.onSale = onSale === "true" || onSale === true;
    }

    // Handle tags
    if (tags !== undefined) {
      let parsedTags = [];
      if (typeof tags === "string") {
        parsedTags = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
      updateData.tags = parsedTags;
    }
    // Handle quickInfo
    if (quickInfo !== undefined) {
      let parsedQuickInfo = {};
      if (typeof quickInfo === "string") {
        try {
          parsedQuickInfo = JSON.parse(quickInfo);
        } catch (e) {
          console.error("Failed to parse quickInfo:", e);
        }
      } else {
        parsedQuickInfo = quickInfo;
      }
      updateData.quickInfo = parsedQuickInfo;
    }
    // Handle shipping fields
    if (shippingInsideDhaka !== undefined) {
      updateData.shippingInsideDhaka = parseFloat(shippingInsideDhaka);
    }
    if (shippingOutsideDhaka !== undefined) {
      updateData.shippingOutsideDhaka = parseFloat(shippingOutsideDhaka);
    }
    // findByIdAndUpdate with runValidators: FALSE to bypass schema validation
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: false,
    });

    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update error:", error);
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

// Search Suggestions and Products
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        status: "success",
        data: [],
      });
    }

    // Search for products by name, category, or tags
    const suggestions = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ],
      status: "active",
    })
      .select("name slug sku category")
      .limit(10)
      .sort({ name: 1 });

    res.status(200).json({
      status: "success",
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
// Full Product Search
export const searchProducts = async (req, res) => {
  try {
    const { q, searchType = "name" } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({
        status: "success",
        data: [],
      });
    }

    let query = { status: "active" };

    if (searchType === "sku") {
      // Exact SKU search
      query.sku = q.trim();
    } else {
      // Search by name, category, slug, or tags
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { slug: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
