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

router.delete(
  "/:id",
  verifyToken,
  checkRole("developer"),
  deleteFile
);

export default router;
