import mongoose from 'mongoose';
import File from './models/file.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const files = await File.find();
    console.log(`Found ${files.length} files in database`);
    
    for (const file of files) {
      const filename = file.fileUrl.split('/uploads/')[1];
      const filePath = path.join(__dirname, 'uploads', filename);
      
      if (!fs.existsSync(filePath)) {
        console.log(`Deleting orphan file: ${file.fileName}`);
        await File.findByIdAndDelete(file._id);
      }
    }
    
    console.log('Cleanup complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
