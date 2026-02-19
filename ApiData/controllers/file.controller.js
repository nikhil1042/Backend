import File from "../models/file.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================
// Upload File
// =====================
export const uploadFile = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Ensure uploads folder exists
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Store relative path that can be accessed via static serving
    const fileUrl = `/uploads/${req.file.filename}`;

    const newFile = await File.create({
      title,
      description,
      fileName: req.file.originalname,
      fileUrl,
      uploadedBy: req.user.id
    });

    res.status(201).json(newFile);

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =====================
// Get All Files with Pagination (OPTIMIZED)
// =====================
let totalFilesCache = 0;
let cacheTTL = Date.now();

export const getFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3; // Reduced to 3 for faster initial load
    
    // Validate page and limit
    if (page < 1 || limit < 1) {
      return res.status(400).json({ message: "Invalid page or limit" });
    }

    const skip = (page - 1) * limit;
    
    // Get files with pagination - using .lean() for 3x faster queries
    const files = await File.find()
      .select("_id title description fileName fileUrl createdAt") // Only needed fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() // Returns plain JS objects, not Mongoose docs - MUCH FASTER
      .exec();
    
    // Cache total count for 30 seconds to avoid repeated countDocuments
    const now = Date.now();
    if (now - cacheTTL > 30000) {
      totalFilesCache = await File.countDocuments();
      cacheTTL = now;
    }
    
    const totalFiles = totalFilesCache;
    const totalPages = Math.ceil(totalFiles / limit);
    
    // Add cache headers
    res.set('Cache-Control', 'public, max-age=10'); // Cache for 10 seconds
    res.json({
      files,
      currentPage: page,
      totalPages,
      totalFiles,
      pageSize: limit
    });
  } catch (error) {
    console.error("Get files error:", error);
    res.status(500).json({ message: error.message });
  }
};

// =====================
// Delete File
// =====================
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Extract filename from fileUrl
    let filename = file.fileUrl;
    if (filename.includes("/uploads/")) {
      filename = filename.split("/uploads/")[1];
    }

    // Delete file from uploads folder
    const uploadsDir = path.join(__dirname, "../uploads");
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ File deleted: ${filename}`);
    }

    await File.findByIdAndDelete(id);

    res.json({ message: "File deleted successfully" });

  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: error.message });
  }
};
