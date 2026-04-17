const cloudinaryModule = require('cloudinary');
const cloudinary = cloudinaryModule.v2;
const CloudinaryStorage = require('multer-storage-cloudinary');

require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Pass the full cloudinary module (not .v2) so multer-storage-cloudinary
// can access .v2 internally as it expects.
const storage = CloudinaryStorage({
  cloudinary: cloudinaryModule,
  folder: 'conditiontrack',
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  transformation: [{ width: 2000, height: 2000, crop: 'limit' }],
});


module.exports = {
    cloudinary,
    storage
  };