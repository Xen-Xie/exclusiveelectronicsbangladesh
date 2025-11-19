import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { DB } from "./src/config/db.js";
import userRoutes from "./src/routes/userRoutes.js";

const app = express();
dotenv.config();

app.use(express.json());

const url = process.env.MONGO_URl;
DB(url);
app.use("/api/user", userRoutes);

const port = process.env.PORT || 5000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server: http://0.0.0.0:${port}`);
});
