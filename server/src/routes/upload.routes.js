const express = require("express");
const router = express.Router();
const { getCloudinary, getUpload } = require("../utils/cloudinary");
const { authenticate, authorizeAdmin } = require("../middleware/auth");
const { sendSuccess, sendError } = require("../utils/response");

router.post(
  "/product-image",
  authenticate,
  authorizeAdmin,
  (req, res, next) => {
    const upload = getUpload();
    upload.single("image")(req, res, (err) => {
      if (err) {
        console.error("MULTER ERROR:", err.message);
        return sendError(res, `Upload error: ${err.message}`, 500);
      }
      next();
    });
  },
  (req, res) => {
    try {
      if (!req.file) {
        return sendError(res, "No image uploaded", 400);
      }
      return sendSuccess(res, { url: req.file.path }, "Image uploaded");
    } catch (err) {
      console.error("UPLOAD ERROR:", err.message);
      return sendError(res, "Upload failed");
    }
  },
);

router.delete(
  "/product-image",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return sendError(res, "URL required", 400);

      const cloudinary = getCloudinary();
      const publicId = url.split("/").slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(publicId);

      return sendSuccess(res, {}, "Image deleted");
    } catch (err) {
      console.error("DELETE IMAGE ERROR:", err.message);
      return sendError(res, "Failed to delete image");
    }
  },
);

module.exports = router;
