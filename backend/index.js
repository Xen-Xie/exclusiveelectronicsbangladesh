import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { DB } from "./src/config/db.js";
import userRoutes from "./src/routes/userRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";

const app = express();
dotenv.config();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://exclusiveelectronicbangladesh.netlify.app",
    ],
    credentials: true,
  })
);

const url = process.env.MONGO_URL;
DB(url);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);

const port = process.env.PORT || 5000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server: http://0.0.0.0:${port}`);
});
