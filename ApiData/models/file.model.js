import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Add indexes for faster queries
fileSchema.index({ createdAt: -1 }); // Fast sorting by creation date
fileSchema.index({ uploadedBy: 1 }); // Fast filtering by uploader

export default mongoose.model("File", fileSchema);
