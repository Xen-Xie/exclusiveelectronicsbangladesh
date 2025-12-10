// migrateProductRatings.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/models/Product.js";
import Review from "./src/models/Review.js";

dotenv.config();

const migrateProductRatings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);

    let migratedCount = 0;

    for (const product of products) {
      try {
        // Get all reviews for this product
        const reviews = await Review.find({ product: product._id });

        if (reviews.length === 0) {
          // No reviews, set default rating summary
          product.ratingSummary = {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          };
        } else {
          // Calculate rating summary
          const totalRating = reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          );
          const averageRating = totalRating / reviews.length;

          const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          reviews.forEach((review) => {
            ratingDistribution[review.rating]++;
          });

          product.ratingSummary = {
            averageRating: parseFloat(averageRating.toFixed(1)),
            totalReviews: reviews.length,
            ratingDistribution,
          };
        }

        await product.save();
        migratedCount++;

        if (migratedCount % 10 === 0) {
          console.log(`Migrated ${migratedCount}/${products.length} products`);
        }
      } catch (error) {
        console.error(`Error migrating product ${product._id}:`, error.message);
      }
    }

    console.log(`Migration complete! Migrated ${migratedCount} products`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateProductRatings();
