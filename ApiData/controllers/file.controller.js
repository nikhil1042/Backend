import File from "../models/file.model.js";
import fs from "fs";

// =====================
// Upload File
// =====================
export const uploadFile = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const newFile = await File.create({
      title,
      description,
      fileName: req.file.originalname,
      fileUrl,
      uploadedBy: req.user.id
    });

    res.status(201).json(newFile);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =====================
// Get All Files
// =====================
export const getFiles = async (req, res) => {
  try {
    const files = await File.find().populate("uploadedBy", "email");
    res.json(files);
  } catch (error) {
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

    // Delete file from uploads folder
    const filePath = file.fileUrl.split("/uploads/")[1];

    fs.unlinkSync(`uploads/${filePath}`);

    await File.findByIdAndDelete(id);

    res.json({ message: "File deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
