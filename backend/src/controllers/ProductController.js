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
      colorFamily,
      imageColors,
    } = req.body;

    // Parse quickInfo
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

    // Parse imageColors array
    let imageColorsArray = [];
    if (imageColors) {
      try {
        imageColorsArray =
          typeof imageColors === "string"
            ? JSON.parse(imageColors)
            : imageColors;
      } catch (e) {
        console.error("Failed to parse imageColors:", e);
        imageColorsArray = [];
      }
    }

    // Upload images to Cloudinary
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer),
      );
      images = await Promise.all(uploadPromises);
      images = images.map((img, idx) => ({
        url: img.url,
        public_id: img.public_id,
        color: imageColorsArray[idx] || "",
      }));
    }

    // Parse tags
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
      price: parseFloat(price),
      salePrice: discountPrice ? parseFloat(discountPrice) : null,
      category,
      stock: parseInt(stock),
      sku: sku || undefined,
      tags: parsedTags,
      featured: featured === "true" || featured === true,
      onSale: onSale === "true" || onSale === true,
      images,
      quickInfo: parsedQuickInfo,
      shippingInsideDhaka:
        shippingInsideDhaka !== undefined ? parseFloat(shippingInsideDhaka) : 0,
      shippingOutsideDhaka:
        shippingOutsideDhaka !== undefined
          ? parseFloat(shippingOutsideDhaka)
          : 60,
      colorFamily: colorFamily || "",
    });

    await newProduct.save();

    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
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
      colorFamily,
      imageColors,
      existingImages,
    } = req.body;

    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    const updateData = {};

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

    // Handle sale price
    const currentPrice = updateData.price || currentProduct.price;
    if (discountPrice !== undefined) {
      if (discountPrice && discountPrice !== "" && !isNaN(discountPrice)) {
        const salePriceValue = parseFloat(discountPrice);
        if (salePriceValue <= currentPrice) {
          updateData.salePrice = salePriceValue;
          updateData.onSale = true;
        } else {
          updateData.salePrice = null;
          updateData.onSale = false;
        }
      } else {
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

    if (shippingInsideDhaka !== undefined)
      updateData.shippingInsideDhaka = parseFloat(shippingInsideDhaka);
    if (shippingOutsideDhaka !== undefined)
      updateData.shippingOutsideDhaka = parseFloat(shippingOutsideDhaka);
    if (colorFamily !== undefined) updateData.colorFamily = colorFamily;

    // Handle images — parse existingImages first, then merge any new uploads
    let parsedExistingImages = [];
    if (existingImages) {
      try {
        parsedExistingImages =
          typeof existingImages === "string"
            ? JSON.parse(existingImages)
            : existingImages;
      } catch (e) {
        console.error("Failed to parse existingImages:", e);
        parsedExistingImages = currentProduct.images;
      }
    }

    if (req.files && req.files.length > 0) {
      // Parse imageColors for newly uploaded files
      let imageColorsArray = [];
      if (imageColors) {
        try {
          imageColorsArray =
            typeof imageColors === "string"
              ? JSON.parse(imageColors)
              : imageColors;
        } catch (e) {
          console.error("Failed to parse imageColors:", e);
          imageColorsArray = [];
        }
      }

      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer),
      );
      const newImages = await Promise.all(uploadPromises);

      const coloredNewImages = newImages.map((img, idx) => ({
        url: img.url,
        public_id: img.public_id,
        color: imageColorsArray[idx] || "",
      }));

      // Merge: existing images keep their order and colors, new uploads appended
      updateData.images = [...parsedExistingImages, ...coloredNewImages];
    } else if (existingImages) {
      // No new uploads — use existing images as sent (preserves order + colors)
      updateData.images = parsedExistingImages;
    }

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
      return res
        .status(404)
        .json({ status: "fail", message: "Product not found" });
    res.status(200).json({ status: "success", data: product });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Get Product by Slug
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product)
      return res
        .status(404)
        .json({ status: "fail", message: "Product not found" });
    res.status(200).json({ status: "success", data: product });
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

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ status: "fail", message: "Product not found" });
    res
      .status(200)
      .json({ status: "success", message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Search Suggestions
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ status: "success", data: [] });
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
      .select("name slug sku category images")
      .limit(10)
      .sort({ name: 1 });
    res.status(200).json({ status: "success", data: suggestions });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Full Product Search
export const searchProducts = async (req, res) => {
  try {
    const { q, searchType = "name" } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(200).json({ status: "success", data: [] });
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
    res.status(500).json({ status: "fail", message: error.message });
  }
};
