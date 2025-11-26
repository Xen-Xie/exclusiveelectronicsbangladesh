import UserBehavior from "../models/UserBehavior.js";
import Product from "../models/Product.js";

// Track user behavior
export const trackBehavior = async (req, res) => {
  try {
    const { type, category, productId, searchTerm, metadata } = req.body;
    const userId = req.user.id;

    // Validate required fields based on type
    if (type === "category_view" && !category) {
      return res.status(400).json({
        status: "fail",
        message: "Category is required for category_view",
      });
    }

    if ((type === "product_view" || type === "product_click") && !productId) {
      return res.status(400).json({
        status: "fail",
        message: "Product ID is required for product interactions",
      });
    }

    if (type === "search" && !searchTerm) {
      return res.status(400).json({
        status: "fail",
        message: "Search term is required for search",
      });
    }

    const behavior = new UserBehavior({
      userId,
      type,
      category,
      productId,
      searchTerm,
      metadata,
    });

    await behavior.save();

    res.status(201).json({
      status: "success",
      message: "Behavior tracked successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Get personalized recommendations for user
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 8;

    // Get user's recent behavior
    const recentBehavior = await UserBehavior.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    if (recentBehavior.length === 0) {
      // If no behavior data, return featured products as fallback
      const featuredProducts = await Product.find({ featured: true })
        .limit(limit)
        .select("name price salePrice onSale images category featured");

      return res.status(200).json({
        status: "success",
        data: featuredProducts,
      });
    }

    // Extract categories and products from behavior
    const viewedCategories = [
      ...new Set(
        recentBehavior.filter((b) => b.category).map((b) => b.category)
      ),
    ];

    const viewedProducts = [
      ...new Set(
        recentBehavior
          .filter((b) => b.productId)
          .map((b) => b.productId.toString())
      ),
    ];

    const searchTerms = [
      ...new Set(
        recentBehavior
          .filter((b) => b.searchTerm)
          .map((b) => b.searchTerm.toLowerCase())
      ),
    ];

    // Build recommendation query
    let recommendedProducts = [];

    // Priority 1: Products from viewed categories that user hasn't seen
    if (viewedCategories.length > 0) {
      const categoryProducts = await Product.find({
        category: { $in: viewedCategories },
        _id: { $nin: viewedProducts },
        status: "active",
      })
        .limit(limit)
        .select("name price salePrice onSale images category featured")
        .sort({ featured: -1, createdAt: -1 });

      recommendedProducts = categoryProducts;
    }

    // Priority 2: If not enough from categories, add products matching search terms
    if (recommendedProducts.length < limit && searchTerms.length > 0) {
      const searchRegex = searchTerms.map((term) => new RegExp(term, "i"));
      const searchProducts = await Product.find({
        $or: [
          { name: { $in: searchRegex } },
          { description: { $in: searchRegex } },
          { tags: { $in: searchTerms } },
        ],
        _id: {
          $nin: [...viewedProducts, ...recommendedProducts.map((p) => p._id)],
        },
        status: "active",
      })
        .limit(limit - recommendedProducts.length)
        .select("name price salePrice onSale images category featured");

      recommendedProducts = [...recommendedProducts, ...searchProducts];
    }

    // Priority 3: If still not enough, add featured products
    if (recommendedProducts.length < limit) {
      const featuredProducts = await Product.find({
        featured: true,
        _id: {
          $nin: [...viewedProducts, ...recommendedProducts.map((p) => p._id)],
        },
        status: "active",
      })
        .limit(limit - recommendedProducts.length)
        .select("name price salePrice onSale images category featured");

      recommendedProducts = [...recommendedProducts, ...featuredProducts];
    }

    res.status(200).json({
      status: "success",
      data: recommendedProducts,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Get user behavior analytics (for admin)
export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.params.userId;

    const analytics = await UserBehavior.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          lastActivity: { $max: "$createdAt" },
        },
      },
    ]);

    // Get most viewed categories
    const topCategories = await UserBehavior.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          category: { $exists: true },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        behaviorSummary: analytics,
        topCategories,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};
