const ImageService = require("../services/ImageService");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const { validationResult } = require("express-validator");

class ImageController {
  /**
   * Generate image with Replicate AI and save to S3
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async generateImage(req, res, next) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new ApiError(400, "Validation error", errors.array()));
      }

      const { prompt, userId, width, height } = req.body;

      // If user is authenticated, use the authenticated user's ID unless explicitly specified
      const userIdToUse = userId || (req.user ? req.user._id : null);

      const options = {
        width: width || 512,
        height: height || 512,
        // Always generate only one image per API call
        numberOfImages: 1,
      };

      const imageResult = await ImageService.generateImage(
        prompt,
        userIdToUse,
        options
      );

      // Create appropriate success message based on whether S3 storage was successful
      const successMessage = imageResult.storedInS3
        ? "Image generated and stored in S3 successfully"
        : "Image generated successfully but could not be stored in S3. Using Replicate URL directly.";

      const response = ApiResponse.success(successMessage, imageResult);
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all generated images for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUserImages(req, res, next) {
    try {
      const userId = req.user._id;

      const images = await ImageService.getUserImages(userId);

      const response = ApiResponse.success(
        "User images retrieved successfully",
        images
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a generated image
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteImage(req, res, next) {
    try {
      const userId = req.user._id;
      const { imageId } = req.params;

      if (!imageId) {
        return next(new ApiError(400, "Image ID is required"));
      }

      const result = await ImageService.deleteImage(userId, imageId);

      const response = ApiResponse.success(
        "Image deleted successfully",
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ImageController();
