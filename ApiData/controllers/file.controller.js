import File from "../models/file.model.js";

// =====================
// Upload File
// =====================
export const uploadFile = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newFile = await File.create({
      title,
      description,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
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

    await File.findByIdAndDelete(id);

    res.json({ message: "File deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
