# Render.com File Upload Fix

## Problem
Render.com uses ephemeral storage - uploaded files are deleted on server restart.

## Solution Options

### Option 1: Use Cloudinary (Recommended - Free tier available)

1. Sign up at https://cloudinary.com
2. Install package:
```bash
npm install cloudinary multer-storage-cloudinary
```

3. Update `.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Update `routes/file.routes.js` to use Cloudinary storage

### Option 2: Use AWS S3
- More complex setup
- Requires AWS account

### Option 3: Run Backend Locally
- Keep backend running on your local machine
- Update Angular API URL to `http://localhost:5000`

## Current Issue
Your image `1771413447537-nikhil_img.jpg` was uploaded to Render but got deleted on restart.

## Immediate Fix
1. Start backend locally: `cd "d:\File share hub\Backend\ApiData" && npm start`
2. Upload new files - they will be saved locally
3. Images will work until you restart the backend
