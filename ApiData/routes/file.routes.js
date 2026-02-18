import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import {
  uploadFile,
  getFiles,
  deleteFile
} from "../controllers/file.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
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
