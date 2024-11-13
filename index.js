import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoutes from "./routes/users.js";
import videoRoutes from "./routes/videos.js";
import commentRoutes from "./routes/comments.js";
import authRoutes from "./routes/auth.js";
import healthRoute from "./routes/health.js";
import fetch from "node-fetch";

const app = express();
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["https://tubeland.onrender.com", "http://localhost:5173"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders:
      "Origin, X-Requested-With, Content-Type, Authorization, Accept",
  })
);

app.use(express.json());

dotenv.config();

const connectDB = () => {
  const dbName =
    process.env.NODE_ENV === "production" ? "videoapp_production" : "test";
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName,
    })
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      throw err;
    });
};

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/health", healthRoute);

app.use((err, req, res, next) => {
  console.error("Error: ", err);
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

// Self-ping to keep server awake
const SELF_PING_INTERVAL = 14 * 60 * 1000;
setInterval(async () => {
  try {
    const response = await fetch(
      "https://tubeland-eu-api.onrender.com/api/health"
    );
    if (response.ok) {
      console.log("Self ping successful");
    } else {
      console.log("Self-ping failed with status:", response.status);
    }
  } catch (error) {
    console.error("Error during self-ping:", error);
  }
}, SELF_PING_INTERVAL);

app.listen(8800, () => {
  connectDB();
  console.log("Connected to server");
});
