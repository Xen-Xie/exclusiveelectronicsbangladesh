import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { DB } from "./src/config/db.js";
import userRoutes from "./src/routes/userRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import behaviorRoutes from "./src/routes/behaviourRoutes.js";
import bannerRoutes from "./src/routes/bannerRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import healthRoutes from "./src/routes/healthRoutes.js";
import wishlistRoutes from "./src/routes/wishlistRoutes.js";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://exclusiveelectronicbangladesh.netlify.app",
      "https://dropore.store",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const url = process.env.MONGO_URL;
DB(url);
app.use("/api/user", userRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/products", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/behavior", behaviorRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api", healthRoutes);
const port = process.env.PORT || 5000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server: http://0.0.0.0:${port}`);
});
