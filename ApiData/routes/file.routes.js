import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import {
  uploadFile,
  getFiles,
  deleteFile
} from "../controllers/file.controller.js";
import File from "../models/file.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure Cloudinary
if (process.env.CLOUDINARY_URL) {
  // Use CLOUDINARY_URL if available (Render format)
  console.log('✅ Using CLOUDINARY_URL');
} else if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Cloudinary credentials missing in environment variables');
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✅ Cloudinary configured:', process.env.CLOUDINARY_CLOUD_NAME);
}

// Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on file mimetype
    const isImage = file.mimetype.startsWith('image/');
    
    return {
      folder: 'file-share-hub',
      resource_type: isImage ? 'image' : 'raw',
      public_id: Date.now() + '-' + file.originalname.split('.')[0],
      format: file.originalname.split('.').pop()
    };
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post(
  "/upload",
  verifyToken,
  checkRole("developer"),
  upload.single("file"),
  uploadFile
);

router.get("/", verifyToken, getFiles);

// Proxy route for viewing files
router.get("/view/:id", verifyToken, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    res.redirect(file.fileUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Proxy route for downloading files
router.get("/download/:id", verifyToken, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    
    // Redirect to Cloudinary URL with download flag
    const downloadUrl = file.fileUrl.replace('/upload/', '/upload/fl_attachment/');
    res.redirect(downloadUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete(
  "/:id",
  verifyToken,
  checkRole("developer"),
  deleteFile
);

export default router;
