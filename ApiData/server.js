import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import fileRoutes from "./routes/file.routes.js";

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create app
const app = express();

// =======================
// Ensure uploads folder exists
// =======================
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Uploads folder created at:", uploadsDir);
}

// =======================
// Middlewares
// =======================
app.use(cors({
  origin: ['http://localhost:4300', 'http://localhost:65231', 'https://backend-i8c3.onrender.com'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Static folder for uploaded files - CRITICAL FOR FILE SERVING
app.use("/uploads", express.static(uploadsDir, {
  maxAge: '1d',
  etag: false,
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=86400');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// =======================
// Routes
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("FileShare API is running...");
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "✅ API is healthy" });
});

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads folder: ${uploadsDir}`);
});
