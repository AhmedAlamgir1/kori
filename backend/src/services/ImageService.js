const AWS = require("aws-sdk");
const Replicate = require("replicate");
const config = require("../config/config");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const axios = require("axios");
const crypto = require("crypto");

// Configure AWS SDK
AWS.config.update({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION,
});

const s3 = new AWS.S3();

// Configure Replicate AI
const replicate = new Replicate({
  auth: config.REPLICATE_API_TOKEN,
});

class ImageService {
  /**
   * Generate an image using Replicate AI and save it to S3
   * @param {string} prompt - The prompt for image generation
   * @param {string} [userId] - Optional user ID to associate image with
   * @param {Object} options - Additional options for image generation
   * @returns {Promise<Object>} - The generated image details
   */
  async generateImage(prompt, userId = null, options = {}) {
    try {
      // Set default options
      const defaultOptions = {
        width: 512,
        height: 512,
        // We only support generating one image per API call
        numberOfImages: 1,
      };

      const imageOptions = { ...defaultOptions, ...options };

      // Check if Replicate API token is configured
      if (!config.REPLICATE_API_TOKEN) {
        throw new ApiError(500, "Replicate API token not configured");
      }

      // Generate image using Replicate
      const output = await replicate.run(config.REPLICATE_MODEL, {
        input: {
          prompt: prompt,
          width: imageOptions.width,
          height: imageOptions.height,
          // Always request just one image from Replicate
          num_outputs: 1,
        },
      });

      if (!output || !output.length) {
        throw new ApiError(500, "Failed to generate image with Replicate AI");
      }

      // We'll only use the first image for now
      const imageUrl = output[0];

      // Download the image from Replicate
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      const imageBuffer = Buffer.from(imageResponse.data);

      // Generate a unique key for S3
      const s3Key = `generated-images/${Date.now()}-${crypto
        .randomBytes(8)
        .toString("hex")}.png`;

      let s3Response = null;
      let s3UploadSuccess = false;

      // Skip S3 upload if explicitly configured to do so
      if (config.SKIP_S3_UPLOAD) {
        console.log("Skipping S3 upload as configured by SKIP_S3_UPLOAD=true");
      } else {
        try {
          // Log S3 parameters to debug
          console.log("S3 upload attempt with params:", {
            bucket: config.AWS_S3_BUCKET,
            region: config.AWS_REGION,
            // Don't log credentials
            hasAccessKey: !!config.AWS_ACCESS_KEY_ID,
            hasSecretKey: !!config.AWS_SECRET_ACCESS_KEY,
          });

          // Upload to S3
          const uploadParams = {
            Bucket: config.AWS_S3_BUCKET,
            Key: s3Key,
            Body: imageBuffer,
            ContentType: "image/png",
          };

          s3Response = await s3.upload(uploadParams).promise();
          s3UploadSuccess = true;
          console.log("S3 upload successful:", s3Response.Location);
        } catch (s3Error) {
          console.error("S3 upload error:", s3Error.message);
          console.error("S3 error code:", s3Error.code);
          console.error("S3 error region:", s3Error.region);
          console.error("S3 error request ID:", s3Error.requestId);
          console.log("Falling back to using the Replicate URL directly");
          // Continue with the original Replicate URL if S3 upload fails
        }
      }

      // Store in user document if userId is provided
      if (userId) {
        const user = await User.findById(userId);
        if (!user) {
          throw new ApiError(404, "User not found");
        }

        user.generatedImages.push({
          imageUrl: s3UploadSuccess ? s3Response.Location : imageUrl,
          s3Key: s3UploadSuccess ? s3Key : null,
          prompt: prompt,
        });

        await user.save();
      }

      return {
        imageUrl: s3UploadSuccess ? s3Response.Location : imageUrl,
        s3Key: s3UploadSuccess ? s3Key : null,
        prompt: prompt,
        rawImageUrl: imageUrl, // The original URL from Replicate
        storedInS3: s3UploadSuccess, // Flag indicating if we successfully stored in S3
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Image generation error:", error);
      throw new ApiError(500, "Failed to generate or save image", error);
    }
  }

  /**
   * Get all generated images for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of image objects
   */
  async getUserImages(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      return user.generatedImages || [];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Get user images error:", error);
      throw new ApiError(500, "Failed to retrieve user images", error);
    }
  }

  /**
   * Delete a generated image
   * @param {string} userId - The user ID
   * @param {string} imageId - The image ID
   * @returns {Promise<Object>} - Deletion status
   */
  async deleteImage(userId, imageId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      const imageIndex = user.generatedImages.findIndex(
        (image) => image._id.toString() === imageId
      );

      if (imageIndex === -1) {
        throw new ApiError(404, "Image not found");
      }

      const image = user.generatedImages[imageIndex];

      // Delete from S3 only if we have an S3 key
      if (image.s3Key) {
        try {
          const deleteParams = {
            Bucket: config.AWS_S3_BUCKET,
            Key: image.s3Key,
          };

          await s3.deleteObject(deleteParams).promise();
        } catch (s3Error) {
          console.error("S3 delete error:", s3Error);
          // Continue even if S3 deletion fails
        }
      }

      // Remove from user document
      user.generatedImages.splice(imageIndex, 1);
      await user.save();

      return { success: true, message: "Image deleted successfully" };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Delete image error:", error);
      throw new ApiError(500, "Failed to delete image", error);
    }
  }
}

module.exports = new ImageService();
