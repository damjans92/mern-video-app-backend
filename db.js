import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  const dbName =
    process.env.NODE_ENV === "production" ? "videoapp_production" : "test";
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName });
    console.log("Connected to DB");
  } catch (err) {
    console.error("Failed to connect to DB", err);
    process.exit(1);
  }
};

export default connectDB;
