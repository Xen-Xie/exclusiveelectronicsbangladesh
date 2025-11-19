import mongoose from "mongoose";


export const DB = async (url) => {
  try {
    await mongoose.connect(url)
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed", error);
  }
};