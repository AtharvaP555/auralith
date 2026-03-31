const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const getCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
};

const getUpload = () => {
  const storage = new CloudinaryStorage({
    cloudinary: getCloudinary(),
    params: {
      folder: "auralith/products",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        {
          width: 800,
          height: 800,
          crop: "fill",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
};

module.exports = { getCloudinary, getUpload };
