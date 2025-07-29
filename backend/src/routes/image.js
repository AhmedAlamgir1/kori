const express = require("express");
const ImageController = require("../controllers/ImageController");
const { generateImageValidator } = require("../validators/imageValidators");
const { authenticate, optionalAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * @route POST /api/images/generate
 * @desc Generate image with Replicate AI and save to S3
 * @access Public (but user ID will be used if authenticated)
 */
router.post(
  "/generate",
  optionalAuth, // Allow both authenticated and unauthenticated requests
  generateImageValidator,
  ImageController.generateImage
);

/**
 * @route GET /api/images/user
 * @desc Get all generated images for the authenticated user
 * @access Private
 */
router.get("/user", authenticate, ImageController.getUserImages);

/**
 * @route DELETE /api/images/:imageId
 * @desc Delete a generated image
 * @access Private
 */
router.delete("/:imageId", authenticate, ImageController.deleteImage);

module.exports = router;
