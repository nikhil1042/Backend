import File from "../models/file.model.js";
import { v2 as cloudinary } from "cloudinary";

// =====================
// Upload File
// =====================
export const uploadFile = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Cloudinary automatically uploads and returns URL
    const fileUrl = req.file.path; // Cloudinary URL

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

    // Extract public_id from Cloudinary URL
    const urlParts = file.fileUrl.split('/');
    const publicIdWithExt = urlParts[urlParts.length - 1];
    const publicId = `file-share-hub/${publicIdWithExt.split('.')[0]}`;

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(publicId);
      console.log(`✅ File deleted from Cloudinary: ${publicId}`);
    } catch (cloudError) {
      console.error('Cloudinary delete error:', cloudError);
    }

    await File.findByIdAndDelete(id);

    res.json({ message: "File deleted successfully" });

  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: error.message });
  }
};
