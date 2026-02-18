import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import fileRoutes from "./routes/file.routes.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create app
const app = express();

// =======================
// Middlewares
// =======================
app.use(cors());
app.use(express.json());

// Static folder for uploaded files
app.use("/uploads", express.static("uploads"));

// =======================
// Routes
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
