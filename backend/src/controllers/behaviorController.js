import UserBehavior from "../models/UserBehavior.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// Track user behavior
export const trackBehavior = async (req, res) => {
  try {
    const {
      type,
      category,
      productId,
      searchTerm,
      metadata,
      sessionId,
      referrer,
    } = req.body;
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

    // Track time spent on page if provided
    if (type === "product_view" && metadata?.timeSpent) {
      // Update existing view with time spent
      const lastView = await UserBehavior.findOne({
        userId,
        type: "product_view",
        productId,
        createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) }, // last 30 mins
      }).sort({ createdAt: -1 });

      if (lastView) {
        lastView.metadata = {
          ...lastView.metadata,
          timeSpent: metadata.timeSpent,
          completedView: metadata.timeSpent >= 30, // considered quality view if 30+ seconds
        };
        await lastView.save();

        return res.status(200).json({
          status: "success",
          message: "View duration updated",
        });
      }
    }

    const behavior = new UserBehavior({
      userId,
      type,
      category,
      productId,
      searchTerm,
      metadata: {
        ...metadata,
        sessionId,
        referrer,
        timestamp: new Date().toISOString(),
      },
    });

    await behavior.save();

    // Trigger async re-ranking for this user
    if (process.env.ENABLE_REALTIME_RECOMMENDATIONS === "true") {
      updateUserRecommendationCache(userId).catch(console.error);
    }

    res.status(201).json({
      status: "success",
      message: "Behavior tracked successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Cache for user recommendations (implement with Redis)
let recommendationCache = new Map();

const updateUserRecommendationCache = async (userId) => {
  try {
    const recommendations = await generateRecommendations(userId);
    recommendationCache.set(userId.toString(), {
      data: recommendations,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Cache update failed:", error);
  }
};

// Main recommendation generation with advanced algorithm
const generateRecommendations = async (userId, options = {}) => {
  const limit = options.limit || 20;
  const diversityFactor = options.diversityFactor || 0.3;

  // Active-like statuses
  const availableStatuses = ["active", "limited"];

  // Get user's recent behavior (last 60 days, more data = better)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const recentBehavior = await UserBehavior.find({
    userId,
    createdAt: { $gte: sixtyDaysAgo },
  })
    .sort({ createdAt: -1 })
    .limit(500); // More data for better analysis

  if (recentBehavior.length === 0) {
    return await getTrendingProducts(limit);
  }

  // Advanced scoring system with time decay
  const eventScores = calculateAdvancedScores(recentBehavior);

  // Collaborative filtering: find similar users
  const similarUsers = await findSimilarUsers(userId, recentBehavior);

  // Item-based collaborative filtering
  const similarProducts = await findSimilarProducts(eventScores.viewedProducts);

  // Session-based recommendations for current browsing session
  const sessionRecommendations = await getSessionBasedRecs(
    userId,
    recentBehavior,
  );

  // Combine all signals
  let candidates = await gatherCandidates({
    eventScores,
    similarUsers,
    similarProducts,
    sessionRecommendations,
    excludeProducts: eventScores.viewedProducts,
    limit: limit * 3,
  });

  // Apply multi-objective scoring
  const scoredCandidates = await scoreCandidatesAdvanced(candidates, {
    eventScores,
    similarUsersScore: similarUsers.length > 0,
    userId,
    diversityFactor,
  });

  // Apply MMR (Maximal Marginal Relevance) for diversity
  const diverseResults = applyMMR(scoredCandidates, limit, diversityFactor);

  return diverseResults;
};

// Advanced scoring with time decay and weighted interactions
const calculateAdvancedScores = (behaviors) => {
  const eventWeights = {
    purchase: 100,
    add_to_cart: 50,
    wishlist: 40,
    product_view: 10,
    product_click: 5,
    category_view: 3,
    search: 2,
    share: 15,
    review: 25,
  };

  const categoryScores = {};
  const productScores = {};
  const viewedProducts = [];
  const searchHistory = [];
  const timeWeights = {};

  const now = Date.now();

  for (const behavior of behaviors) {
    const daysAgo = (now - behavior.createdAt) / (1000 * 60 * 60 * 24);
    // Exponential time decay: newer interactions weighted much higher
    const timeDecay = Math.exp(-daysAgo / 15); // 15-day half-life
    let baseWeight = eventWeights[behavior.type] || 1;

    // Boost quality interactions
    if (behavior.metadata?.completedView) baseWeight *= 2;
    if (behavior.metadata?.addedToCart) baseWeight *= 1.5;
    if (behavior.metadata?.purchased) baseWeight *= 3;

    const finalWeight = baseWeight * timeDecay;

    // Category scoring
    if (behavior.category) {
      categoryScores[behavior.category] =
        (categoryScores[behavior.category] || 0) + finalWeight;
    }

    // Product scoring
    if (behavior.productId) {
      const pid = behavior.productId.toString();
      productScores[pid] = (productScores[pid] || 0) + finalWeight;
      if (!viewedProducts.includes(pid)) viewedProducts.push(pid);
    }

    // Search terms with TF-IDF weighting
    if (behavior.searchTerm) {
      searchHistory.push({
        term: behavior.searchTerm.toLowerCase(),
        weight: finalWeight,
        timestamp: behavior.createdAt,
      });
    }
  }

  return {
    categoryScores: Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {}),
    productScores,
    viewedProducts,
    searchHistory,
  };
};

// Collaborative filtering: find users with similar behavior patterns
const findSimilarUsers = async (userId, userBehavior) => {
  // Get user's top categories and products
  const userCategories = new Set();
  const userProducts = new Set();

  for (const behavior of userBehavior) {
    if (behavior.category) userCategories.add(behavior.category);
    if (behavior.productId) userProducts.add(behavior.productId.toString());
  }

  // Find users who interacted with similar products/categories
  const similarUsers = await UserBehavior.aggregate([
    {
      $match: {
        userId: { $ne: new mongoose.Types.ObjectId(userId) },
        $or: [
          { category: { $in: Array.from(userCategories) } },
          {
            productId: {
              $in: Array.from(userProducts).map(
                (id) => new mongoose.Types.ObjectId(id),
              ),
            },
          },
        ],
        createdAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: "$userId",
        commonInteractions: { $sum: 1 },
        interactions: { $push: "$$ROOT" },
      },
    },
    { $sort: { commonInteractions: -1 } },
    { $limit: 10 },
  ]);

  return similarUsers;
};

// Find products similar to ones user liked (item-based CF)
const findSimilarProducts = async (productScores) => {
  if (Object.keys(productScores).length === 0) return [];

  const productIds = Object.keys(productScores);

  // Use co-occurrence: products often viewed/bought together
  const similarProducts = await UserBehavior.aggregate([
    {
      $match: {
        productId: {
          $in: productIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        type: { $in: ["purchase", "add_to_cart", "product_view"] },
      },
    },
    {
      $group: {
        _id: "$sessionId",
        products: { $addToSet: "$productId" },
      },
    },
    { $match: { "products.1": { $exists: true } } }, // sessions with multiple products
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products",
        cooccurrence: { $sum: 1 },
      },
    },
    { $sort: { cooccurrence: -1 } },
    { $limit: 50 },
  ]);

  return similarProducts;
};

// Session-based recommendations (temporary interest)
const getSessionBasedRecs = async (userId, recentBehavior) => {
  // Get last 30 minutes of activity
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
  const sessionBehaviors = recentBehavior.filter(
    (b) => b.createdAt > thirtyMinsAgo,
  );

  if (sessionBehaviors.length === 0) return [];

  // Get the last product viewed
  const lastView = sessionBehaviors.find((b) => b.type === "product_view");
  if (!lastView || !lastView.productId) return [];

  // Find products in same category or with similar tags
  const lastProduct = await Product.findById(lastView.productId);
  if (!lastProduct) return [];

  return await Product.find({
    $or: [
      { category: lastProduct.category },
      { tags: { $in: lastProduct.tags || [] } },
    ],
    _id: { $ne: lastProduct._id },
    status: { $in: ["active", "limited"] },
  })
    .limit(10)
    .select(
      "_id name price salePrice onSale images category ratingSummary sold",
    );
};

// Gather candidates from multiple sources
const gatherCandidates = async ({
  eventScores,
  similarUsers,
  similarProducts,
  sessionRecommendations,
  excludeProducts,
  limit,
}) => {
  let candidates = [];
  const candidateIds = new Set();

  // Source 1: Top category products (weighted by user preference)
  const topCategories = Object.keys(eventScores.categoryScores).slice(0, 5);
  if (topCategories.length > 0) {
    const categoryProducts = await Product.find({
      category: { $in: topCategories },
      _id: {
        $nin: excludeProducts.map((id) => new mongoose.Types.ObjectId(id)),
      },
      status: { $in: ["active", "limited"] },
    })
      .limit(limit)
      .lean();

    for (const product of categoryProducts) {
      if (!candidateIds.has(product._id.toString())) {
        candidateIds.add(product._id.toString());
        candidates.push(product);
      }
    }
  }

  // Source 2: Products from similar users
  if (similarUsers.length > 0 && candidates.length < limit * 2) {
    const similarUserProducts = [];
    for (const user of similarUsers.slice(0, 5)) {
      const userProducts = await UserBehavior.find({
        userId: user._id,
        type: { $in: ["purchase", "add_to_cart"] },
        productId: {
          $nin: excludeProducts.map((id) => new mongoose.Types.ObjectId(id)),
        },
      })
        .distinct("productId")
        .limit(20);

      similarUserProducts.push(...userProducts);
    }

    const uniqueProductIds = [
      ...new Set(similarUserProducts.map((id) => id.toString())),
    ];
    const products = await Product.find({
      _id: {
        $in: uniqueProductIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
      status: { $in: ["active", "limited"] },
    }).lean();

    for (const product of products) {
      if (!candidateIds.has(product._id.toString())) {
        candidateIds.add(product._id.toString());
        candidates.push(product);
      }
    }
  }

  // Source 3: Session-based recommendations
  for (const product of sessionRecommendations) {
    if (!candidateIds.has(product._id.toString())) {
      candidateIds.add(product._id.toString());
      candidates.push(product);
    }
  }

  // Source 4: High-rated popular products (for freshness)
  if (candidates.length < limit * 2) {
    const popularProducts = await Product.find({
      _id: {
        $nin: excludeProducts.map((id) => new mongoose.Types.ObjectId(id)),
      },
      status: { $in: ["active", "limited"] },
    })
      .sort({ "ratingSummary.averageRating": -1, sold: -1 })
      .limit(limit)
      .lean();

    for (const product of popularProducts) {
      if (!candidateIds.has(product._id.toString())) {
        candidateIds.add(product._id.toString());
        candidates.push(product);
      }
    }
  }

  return candidates;
};

// Advanced multi-objective scoring
const scoreCandidatesAdvanced = async (candidates, context) => {
  const scored = [];

  for (const product of candidates) {
    let score = 0;
    const scoreBreakdown = {};

    // 1. Category affinity (35% weight)
    const categoryAffinity =
      context.eventScores.categoryScores[product.category] || 0;
    const categoryScore = Math.min(categoryAffinity / 100, 1) * 35;
    score += categoryScore;
    scoreBreakdown.category = categoryScore;

    // 2. Product similarity to viewed products (25% weight)
    let similarityScore = 0;
    if (context.eventScores.productScores[product._id.toString()]) {
      similarityScore =
        Math.min(
          context.eventScores.productScores[product._id.toString()] / 50,
          1,
        ) * 25;
    }
    score += similarityScore;
    scoreBreakdown.similarity = similarityScore;

    // 3. Collaborative filtering boost (20% weight)
    let collabScore = 0;
    if (context.similarUsersScore) {
      collabScore = 15; // Base boost for collaborative filtering
    }
    score += collabScore;
    scoreBreakdown.collaborative = collabScore;

    // 4. Product quality metrics (15% weight)
    let qualityScore = 0;
    qualityScore += ((product.ratingSummary?.averageRating || 0) / 5) * 7; // Rating: 0-7 points
    qualityScore += Math.min((product.sold || 0) / 100, 5); // Popularity: 0-5 points
    qualityScore += product.featured ? 3 : 0; // Featured: 3 points
    qualityScore += product.status === "limited" ? 2 : 0; // Urgency: 2 points
    qualityScore = Math.min(qualityScore, 15);
    score += qualityScore;
    scoreBreakdown.quality = qualityScore;

    // 5. Personalization diversity penalty (prevent category flooding)
    // This will be handled by MMR later

    // 6. Time-based freshness (5% weight)
    const daysOld =
      (Date.now() - new Date(product.createdAt || product.updatedAt)) /
      (1000 * 60 * 60 * 24);
    const freshnessScore = Math.max(0, 1 - daysOld / 90) * 5;
    score += freshnessScore;
    scoreBreakdown.freshness = freshnessScore;

    scored.push({
      product,
      score,
      scoreBreakdown,
      category: product.category,
    });
  }

  return scored.sort((a, b) => b.score - a.score);
};

// MMR for diversity
const applyMMR = (scoredCandidates, limit, diversityFactor = 0.3) => {
  const selected = [];
  const remaining = [...scoredCandidates];

  while (selected.length < limit && remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];

      // Calculate similarity to already selected items
      let maxSimilarity = 0;
      for (const selectedItem of selected) {
        const similarity = calculateProductSimilarity(
          candidate.product,
          selectedItem.product,
        );
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }

      // MMR formula: λ * relevance - (1-λ) * similarity
      const mmrScore =
        (1 - diversityFactor) * candidate.score -
        diversityFactor * maxSimilarity;

      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIdx = i;
      }
    }

    selected.push(remaining[bestIdx]);
    remaining.splice(bestIdx, 1);
  }

  return selected.map((s) => s.product);
};

// Calculate similarity between two products
const calculateProductSimilarity = (product1, product2) => {
  let similarity = 0;
  let factors = 0;

  // Category similarity
  if (product1.category === product2.category) {
    similarity += 0.5;
    factors += 0.5;
  }

  // Tag similarity
  if (product1.tags && product2.tags) {
    const commonTags = product1.tags.filter((tag) =>
      product2.tags.includes(tag),
    );
    const tagSimilarity =
      commonTags.length / Math.max(product1.tags.length, product2.tags.length);
    similarity += tagSimilarity * 0.3;
    factors += 0.3;
  }

  // Price similarity (within 20%)
  const price1 = product1.salePrice || product1.price;
  const price2 = product2.salePrice || product2.price;
  const priceRatio = Math.min(price1, price2) / Math.max(price1, price2);
  if (priceRatio > 0.8) {
    similarity += 0.2;
    factors += 0.2;
  }

  return factors > 0 ? similarity / factors : 0;
};

// Trending products fallback
const getTrendingProducts = async (limit) => {
  // Get products trending in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const trending = await UserBehavior.aggregate([
    {
      $match: {
        type: { $in: ["purchase", "add_to_cart", "product_view"] },
        productId: { $exists: true },
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: "$productId",
        score: {
          $sum: {
            $switch: {
              branches: [
                { case: { $eq: ["$type", "purchase"] }, then: 10 },
                { case: { $eq: ["$type", "add_to_cart"] }, then: 5 },
                { case: { $eq: ["$type", "product_view"] }, then: 1 },
              ],
              default: 1,
            },
          },
        },
      },
    },
    { $sort: { score: -1 } },
    { $limit: limit },
  ]);

  const productIds = trending.map((t) => t._id);

  return await Product.find({
    _id: { $in: productIds },
    status: { $in: ["active", "limited"] },
  }).select(
    "name price salePrice onSale images category featured status stockStatus ratingSummary sold",
  );
};

// Public endpoint with caching
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 8;
    const diversityFactor = parseFloat(req.query.diversity) || 0.3;
    const useCache = req.query.cache !== "false";

    // Check cache
    if (useCache && recommendationCache.has(userId)) {
      const cached = recommendationCache.get(userId);
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        // 5 minutes cache
        return res.status(200).json({
          status: "success",
          source: "cache",
          data: cached.data.slice(0, limit),
        });
      }
    }

    const recommendations = await generateRecommendations(userId, {
      limit,
      diversityFactor,
    });

    // Cache results
    recommendationCache.set(userId.toString(), {
      data: recommendations,
      timestamp: Date.now(),
    });

    res.status(200).json({
      status: "success",
      source: "personalized",
      algorithm_version: "2.0",
      data: recommendations.slice(0, limit),
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Hybrid recommendation: combine multiple strategies
export const getHybridRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 8;

    // Run multiple strategies in parallel
    const [personalized, trending, collaborative] = await Promise.all([
      generateRecommendations(userId, {
        limit: limit * 2,
        diversityFactor: 0.4,
      }),
      getTrendingProducts(limit),
      findSimilarUsersBasedRecs(userId, limit),
    ]);

    // Combine with weights
    const combined = new Map();

    // 60% weight to personalized
    personalized.forEach((p, idx) => {
      combined.set(p._id.toString(), {
        product: p,
        score: (1 - idx / personalized.length) * 60,
      });
    });

    // 25% weight to trending
    trending.forEach((p, idx) => {
      const existing = combined.get(p._id.toString());
      const score = (1 - idx / trending.length) * 25;
      if (existing) {
        existing.score += score;
      } else {
        combined.set(p._id.toString(), { product: p, score });
      }
    });

    // 15% weight to collaborative
    collaborative.forEach((p, idx) => {
      const existing = combined.get(p._id.toString());
      const score = (1 - idx / collaborative.length) * 15;
      if (existing) {
        existing.score += score;
      } else {
        combined.set(p._id.toString(), { product: p, score });
      }
    });

    const finalRecommendations = Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.product);

    res.status(200).json({
      status: "success",
      source: "hybrid",
      strategies: ["personalized", "trending", "collaborative"],
      data: finalRecommendations,
    });
  } catch (error) {
    console.error("Hybrid recommendations error:", error);
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// Helper: Find similar users based recommendations
const findSimilarUsersBasedRecs = async (userId, limit) => {
  const userBehavior = await UserBehavior.find({ userId }).limit(100);
  const userCategories = [
    ...new Set(userBehavior.map((b) => b.category).filter(Boolean)),
  ];

  const similarUsers = await UserBehavior.aggregate([
    {
      $match: {
        userId: { $ne: new mongoose.Types.ObjectId(userId) },
        category: { $in: userCategories },
        type: { $in: ["purchase", "add_to_cart"] },
      },
    },
    {
      $group: {
        _id: "$userId",
        score: { $sum: 1 },
      },
    },
    { $sort: { score: -1 } },
    { $limit: 5 },
  ]);

  if (similarUsers.length === 0) return [];

  const products = await UserBehavior.aggregate([
    {
      $match: {
        userId: { $in: similarUsers.map((u) => u._id) },
        type: { $in: ["purchase", "add_to_cart"] },
        productId: { $exists: true },
      },
    },
    {
      $group: {
        _id: "$productId",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit * 2 },
  ]);

  const productIds = products.map((p) => p._id);

  return await Product.find({
    _id: { $in: productIds },
    status: { $in: ["active", "limited"] },
  })
    .select(
      "name price salePrice onSale images category featured status stockStatus ratingSummary sold",
    )
    .limit(limit);
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

    // Get most viewed categories with weights
    const topCategories = await UserBehavior.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          category: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          weightedScore: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ["$type", "purchase"] }, then: 10 },
                  { case: { $eq: ["$type", "add_to_cart"] }, then: 5 },
                  { case: { $eq: ["$type", "product_view"] }, then: 2 },
                ],
                default: 1,
              },
            },
          },
        },
      },
      { $sort: { weightedScore: -1 } },
      { $limit: 5 },
    ]);

    // Get user's purchase history
    const purchaseHistory = await UserBehavior.find({
      userId: new mongoose.Types.ObjectId(userId),
      type: "purchase",
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("productId", "name price category");

    res.status(200).json({
      status: "success",
      data: {
        behaviorSummary: analytics,
        topCategories,
        recentPurchases: purchaseHistory,
        totalInteractions: analytics.reduce((sum, a) => sum + a.count, 0),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};
