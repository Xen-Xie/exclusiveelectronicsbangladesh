import Banner from "../models/Banner.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// Upload image to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "banners" },
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

// Get all banners (admin only)
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: banners.length,
      data: banners,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Get active banners only (public route)
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.findActive();

    res.status(200).json({
      status: "success",
      results: banners.length,
      data: banners,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Create banner
export const createBanner = async (req, res) => {
  try {
    const { title, link, isActive, order, startDate, endDate, target } =
      req.body;

    // Check if image is provided
    if (!req.file) {
      return res.status(400).json({
        status: "fail",
        message: "Banner image is required",
      });
    }

    // Upload image to Cloudinary
    const imageData = await uploadToCloudinary(req.file.buffer);

    const banner = await Banner.create({
      title,
      image: imageData,
      link: link || "",
      isActive: isActive === "true" || isActive === true,
      order: order || 0,
      startDate: startDate || Date.now(),
      endDate: endDate || null,
      target: target || "_self",
    });

    res.status(201).json({
      status: "success",
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    // Delete uploaded image if banner creation fails
    if (req.file) {
      try {
        const imageData = await uploadToCloudinary(req.file.buffer);
        await cloudinary.uploader.destroy(imageData.public_id);
      } catch (deleteError) {
        console.error("Failed to delete uploaded image:", deleteError);
      }
    }

    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Update banner
export const updateBanner = async (req, res) => {
  try {
    const { title, link, isActive, order, startDate, endDate, target } =
      req.body;

    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        status: "fail",
        message: "Banner not found",
      });
    }

    let imageData = banner.image;

    // If new image is provided, upload and delete old one
    if (req.file) {
      // Upload new image
      const newImageData = await uploadToCloudinary(req.file.buffer);

      // Delete old image from Cloudinary
      if (banner.image.public_id) {
        await cloudinary.uploader.destroy(banner.image.public_id);
      }

      imageData = newImageData;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      {
        title,
        image: imageData,
        link: link || "",
        isActive: isActive === "true" || isActive === true,
        order: order || 0,
        startDate: startDate || banner.startDate,
        endDate: endDate || null,
        target: target || "_self",
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      message: "Banner updated successfully",
      data: updatedBanner,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Delete banner
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        status: "fail",
        message: "Banner not found",
      });
    }

    // Delete image from Cloudinary
    if (banner.image.public_id) {
      await cloudinary.uploader.destroy(banner.image.public_id);
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Banner deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Toggle banner status
export const toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        status: "fail",
        message: "Banner not found",
      });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.status(200).json({
      status: "success",
      data: banner,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};
