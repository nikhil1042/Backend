# Fix Image Upload Issue - Cloudinary Setup

## Problem
Render.com uses ephemeral storage - uploaded files are deleted on server restart.

## Solution: Use Cloudinary (Free Tier)

### 1. Sign up at Cloudinary
https://cloudinary.com/users/register/free

### 2. Install Cloudinary
```bash
cd "d:\File share hub\Backend\ApiData"
npm install cloudinary multer-storage-cloudinary
```

### 3. Update .env
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Update file.routes.js
```javascript
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'file-share-hub',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
  },
});

const upload = multer({ storage });
```

### 5. Push to GitHub & Redeploy
```bash
git add .
git commit -m "Add Cloudinary for file storage"
git push origin main
```

Render will auto-deploy with Cloudinary support.

## Temporary Fix (Until Cloudinary Setup)
Delete old files from database:
```bash
cd "d:\File share hub\Backend\ApiData"
node cleanup-files.js
```

Then upload new files - they will work until next restart.
