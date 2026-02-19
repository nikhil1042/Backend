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
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'file-share-hub',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'zip'],
    resource_type: 'auto'
  }
});

const upload = multer({ storage });

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
