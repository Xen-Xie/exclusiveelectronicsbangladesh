import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

// Helper function to update product rating summary
const updateProductRatingSummary = async (productId) => {
  try {
    const reviews = await Review.find({ product: productId });

    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        "ratingSummary.averageRating": 0,
        "ratingSummary.totalReviews": 0,
        "ratingSummary.ratingDistribution": { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    await Product.findByIdAndUpdate(productId, {
      "ratingSummary.averageRating": parseFloat(averageRating.toFixed(1)),
      "ratingSummary.totalReviews": reviews.length,
      "ratingSummary.ratingDistribution": ratingDistribution,
    });
  } catch (error) {
    console.error("Error updating product rating summary:", error);
  }
};

// Check if user can review a product
export const canReviewProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Check if user has purchased this product (any delivered order)
    const order = await Order.findOne({
      user: userId,
      "items.product": productId,
      status: "delivered",
    });

    if (!order) {
      return res.json({
        canReview: false,
        message: "You can only review products you have purchased",
        hasPurchased: false,
        hasReviewed: false,
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });

    // Find the specific order item
    const orderItem = order.items.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingReview) {
      return res.json({
        canReview: true, // Can edit existing review
        message:
          "You have already reviewed this product. You can edit your review.",
        hasPurchased: true,
        hasReviewed: true,
        existingReview: {
          _id: existingReview._id,
          rating: existingReview.rating,
          comment: existingReview.comment,
          images: existingReview.images,
          editCount: existingReview.editCount,
          lastEditedAt: existingReview.lastEditedAt,
          createdAt: existingReview.createdAt,
        },
      });
    }

    res.json({
      canReview: true,
      hasPurchased: true,
      hasReviewed: false,
      orderId: order._id,
      orderItem: {
        name: orderItem.name,
        price: orderItem.price,
        qty: orderItem.qty,
        purchasedAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    res.status(500).json({
      success: false,
      message: "Server error checking review eligibility",
    });
  }
};

// Get user's existing review for a product
export const getMyReviewForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const review = await Review.findOne({
      user: userId,
      product: productId,
    }).populate("product", "name images slug");

    if (!review) {
      return res.json({
        success: true,
        hasReview: false,
        message: "You have not reviewed this product yet",
      });
    }

    res.json({
      success: true,
      hasReview: true,
      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        images: review.images,
        editCount: review.editCount,
        lastEditedAt: review.lastEditedAt,
        isEdited: review.isEdited,
        createdAt: review.createdAt,
        product: review.product,
      },
    });
  } catch (error) {
    console.error("Error getting user review:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting your review",
    });
  }
};

// Submit or Update a review
export const submitReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rating between 1 and 5",
      });
    }

    // Validate comment
    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Review comment must be at least 10 characters",
      });
    }

    // Check if user has purchased this product
    const order = await Order.findOne({
      user: userId,
      "items.product": productId,
      status: "delivered",
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "You can only review products you have purchased",
      });
    }

    // Check for existing review
    let existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });

    // Handle image uploads from memory buffer
    let reviewImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          // Use file.buffer instead of file.path for memory storage
          const result = await uploadToCloudinary(file.buffer, "reviews");
          reviewImages.push({
            url: result.secure_url,
            public_id: result.public_id,
          });
        } catch (uploadError) {
          console.error("Error uploading image to Cloudinary:", uploadError);
        }
      }
    }

    let review;
    let isNewReview = false;

    if (existingReview) {
      // Update existing review

      // Delete old images if new images are being uploaded
      if (reviewImages.length > 0 && existingReview.images.length > 0) {
        for (const image of existingReview.images) {
          try {
            await deleteFromCloudinary(image.public_id);
          } catch (deleteError) {
            console.error("Error deleting old image:", deleteError);
          }
        }
      }

      // Update the review
      existingReview.rating = parseInt(rating);
      existingReview.comment = comment.trim();
      existingReview.images =
        reviewImages.length > 0 ? reviewImages : existingReview.images;

      await existingReview.save();
      review = existingReview;
    } else {
      // Create New review
      review = new Review({
        user: userId,
        product: productId,
        order: order._id,
        rating: parseInt(rating),
        comment: comment.trim(),
        images: reviewImages,
        isVerifiedPurchase: true,
      });

      await review.save();
      isNewReview = true;
    }

    // Update product rating summary
    await updateProductRatingSummary(productId);

    // Populate user info for response
    await review.populate("user", "name");

    res.status(isNewReview ? 201 : 200).json({
      success: true,
      message: isNewReview
        ? "Review submitted successfully"
        : "Review updated successfully",
      isNewReview,
      review: {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        images: review.images,
        user: review.user,
        editCount: review.editCount,
        lastEditedAt: review.lastEditedAt,
        isEdited: review.isEdited,
        createdAt: review.createdAt,
        formattedDate: review.formattedDate,
        isVerifiedPurchase: review.isVerifiedPurchase,
      },
    });
  } catch (error) {
    console.error("Error submitting review:", error);

    // Clean up uploaded images if there was an error
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
        } catch (cleanupError) {
          console.error("Error cleaning up uploaded files:", cleanupError);
        }
      }
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error submitting review",
    });
  }
};

// Get product reviews with edited status

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = "newest",
      rating,
      hasImages,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user?._id; // Get user ID if authenticated

    // Build query
    let query = { product: new mongoose.Types.ObjectId(productId) };

    // Filter by rating
    if (rating && [1, 2, 3, 4, 5].includes(parseInt(rating))) {
      query.rating = parseInt(rating);
    }

    // Filter by images
    if (hasImages === "true") {
      query.images = { $exists: true, $ne: [] };
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "highest":
        sortOption = { rating: -1 };
        break;
      case "lowest":
        sortOption = { rating: 1 };
        break;
      case "helpful":
        sortOption = { helpfulCount: -1 };
        break;
      case "recently_edited":
        sortOption = { lastEditedAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Get reviews with pagination
    const reviews = await Review.find(query)
      .populate("user", "name")
      .populate("helpfulUsers", "_id name") // Populate helpfulUsers to check if current user has voted
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Format reviews with edit info and helpful status
    const formattedReviews = reviews.map((review) => {
      // Check if current user has marked this review as helpful
      let userHasMarked = false;
      if (userId) {
        userHasMarked =
          review.helpfulUsers?.some(
            (user) => user._id.toString() === userId.toString()
          ) || false;
      }

      return {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        images: review.images,
        user: review.user,
        helpfulCount: review.helpfulCount,
        userHasMarked,
        isVerifiedPurchase: review.isVerifiedPurchase,
        editCount: review.editCount,
        lastEditedAt: review.lastEditedAt,
        isEdited: review.editCount > 0,
        createdAt: review.createdAt,
        formattedDate: review.formattedDate,
        formattedLastEditDate: review.formattedLastEditDate,
      };
    });

    // Get total count
    const total = await Review.countDocuments(query);

    // Get rating distribution for this product
    const ratingStats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingStats.forEach((stat) => {
      ratingDistribution[stat._id] = stat.count;
    });

    // Get average rating
    const avgResult = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const averageRating =
      avgResult.length > 0
        ? parseFloat(avgResult[0].averageRating.toFixed(1))
        : 0;
    const totalReviews = avgResult.length > 0 ? avgResult[0].totalReviews : 0;

    // Get count of reviews with images
    const reviewsWithImages = await Review.countDocuments({
      product: productId,
      images: { $exists: true, $ne: [] },
    });

    // Get count of edited reviews
    const editedReviewsCount = await Review.countDocuments({
      product: productId,
      editCount: { $gt: 0 },
    });

    res.json({
      success: true,
      reviews: formattedReviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalReviews: total,
        hasNextPage: skip + reviews.length < total,
        hasPrevPage: page > 1,
      },
      summary: {
        averageRating,
        totalReviews,
        ratingDistribution,
        reviewsWithImages,
        editedReviewsCount,
      },
    });
  } catch (error) {
    console.error("Error getting product reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting reviews",
    });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ user: userId })
      .populate("product", "name images slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Format with edit info
    const formattedReviews = reviews.map((review) => ({
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      images: review.images,
      editCount: review.editCount,
      lastEditedAt: review.lastEditedAt,
      isEdited: review.editCount > 0,
      createdAt: review.createdAt,
      product: review.product,
      helpfulCount: review.helpfulCount,
    }));

    const total = await Review.countDocuments({ user: userId });

    res.json({
      success: true,
      reviews: formattedReviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalReviews: total,
      },
    });
  } catch (error) {
    console.error("Error getting user reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting user reviews",
    });
  }
};

// Get edit history for a review (for user to see their edit history)
export const getEditHistory = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findOne({
      _id: reviewId,
      user: userId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or unauthorized",
      });
    }

    // Format edit history
    const formattedHistory = review.editHistory.map((edit, index) => ({
      editNumber: review.editHistory.length - index,
      rating: edit.rating,
      comment: edit.comment,
      images: edit.images,
      editedAt: edit.editedAt,
      formattedDate: new Date(edit.editedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    res.json({
      success: true,
      editHistory: formattedHistory,
      currentReview: {
        rating: review.rating,
        comment: review.comment,
        images: review.images,
        editCount: review.editCount,
        lastEditedAt: review.lastEditedAt,
      },
    });
  } catch (error) {
    console.error("Error getting edit history:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting edit history",
    });
  }
};

// Update markHelpful function
export const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Prevent user from marking their own review as helpful
    if (review.user.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot mark your own review as helpful",
      });
    }

    // Check if user already marked this review as helpful
    const alreadyHelpful = review.helpfulUsers.some(
      (user) => user.toString() === userId.toString()
    );

    let updatedReview;
    let message;

    if (alreadyHelpful) {
      // Remove helpful vote
      updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        {
          $pull: { helpfulUsers: userId },
          $inc: { helpfulCount: -1 },
        },
        { new: true }
      );
      message = "Removed helpful vote";
    } else {
      // Add helpful vote
      updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        {
          $addToSet: { helpfulUsers: userId },
          $inc: { helpfulCount: 1 },
        },
        { new: true }
      );
      message = "Marked as helpful";
    }

    // Check if user has already found this helpful
    const userHasMarked = updatedReview.helpfulUsers.some(
      (user) => user.toString() === userId.toString()
    );

    res.json({
      success: true,
      message,
      helpfulCount: updatedReview.helpfulCount,
      userHasMarked,
    });
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    res.status(500).json({
      success: false,
      message: "Server error marking review as helpful",
    });
  }
};

// Check if user has marked a review as helpful
export const checkHelpfulStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const userHasMarked = review.helpfulUsers.some(
      (user) => user.toString() === userId.toString()
    );

    res.json({
      success: true,
      userHasMarked,
      helpfulCount: review.helpfulCount,
    });
  } catch (error) {
    console.error("Error checking helpful status:", error);
    res.status(500).json({
      success: false,
      message: "Server error checking helpful status",
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findOne({
      _id: reviewId,
      user: userId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or unauthorized",
      });
    }

    // Delete images from Cloudinary
    if (review.images && review.images.length > 0) {
      for (const image of review.images) {
        try {
          await deleteFromCloudinary(image.public_id);
        } catch (deleteError) {
          console.error("Error deleting image from Cloudinary:", deleteError);
        }
      }
    }

    const productId = review.product;
    await Review.findByIdAndDelete(reviewId);

    // Update product rating summary
    await updateProductRatingSummary(productId);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting review",
    });
  }
};

// Get recent reviews
export const getRecentReviews = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const reviews = await Review.find()
      .populate("user", "name")
      .populate("product", "name images slug")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Format with edit info
    const formattedReviews = reviews.map((review) => ({
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      images: review.images,
      user: review.user,
      product: review.product,
      editCount: review.editCount,
      lastEditedAt: review.lastEditedAt,
      isEdited: review.editCount > 0,
      createdAt: review.createdAt,
      formattedDate: review.formattedDate,
      isVerifiedPurchase: review.isVerifiedPurchase,
    }));

    res.json({
      success: true,
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error("Error getting recent reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting recent reviews",
    });
  }
};

// Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      productId,
      userId,
      rating,
      sort = "newest",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = {};

    if (productId) {
      query.product = new mongoose.Types.ObjectId(productId);
    }

    if (userId) {
      query.user = new mongoose.Types.ObjectId(userId);
    }

    if (rating && [1, 2, 3, 4, 5].includes(parseInt(rating))) {
      query.rating = parseInt(rating);
    }
  } catch (error) {
    console.error("Error getting all reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting reviews",
    });
  }
};

// Toggle featured status
export const toggleFeatured = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.isFeatured = !review.isFeatured;
    await review.save();

    res.json({
      success: true,
      message: `Review ${
        review.isFeatured ? "featured" : "unfeatured"
      } successfully`,
      isFeatured: review.isFeatured,
    });
  } catch (error) {
    console.error("Error toggling featured status:", error);
    res.status(500).json({
      success: false,
      message: "Server error toggling featured status",
    });
  }
};
