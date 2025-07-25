const { body, param, query, validationResult } = require("express-validator");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");
const { MESSAGE_ROLES } = require("../constants/messageRoles");

// Create chat validation
const createChatValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Chat title must be between 1 and 200 characters"),
];

// Add prompt validation
const addPromptValidation = [
  body("imageUrl")
    .notEmpty()
    .withMessage("Image URL is required")
    .isURL()
    .withMessage("Invalid image URL format")
    .matches(/\.(jpg|jpeg|png|gif|webp)$/i)
    .withMessage("Image URL must end with a valid image extension"),

  body("background")
    .trim()
    .notEmpty()
    .withMessage("Background story is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Background must be between 10 and 2,000 characters"),

  body("category")
    .isIn([
      "professional",
      "creative",
      "educational",
      "entertainment",
      "wellness",
      "technology",
      "business",
      "lifestyle",
      "other",
    ])
    .withMessage("Category must be one of the predefined values"),

  body("initialPrompt")
    .trim()
    .notEmpty()
    .withMessage("Initial prompt is required")
    .isLength({ min: 5, max: 1000 })
    .withMessage("Initial prompt must be between 5 and 1,000 characters"),

  body("profile.name")
    .trim()
    .notEmpty()
    .withMessage("Profile name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Name must be between 1 and 100 characters"),

  body("profile.designation")
    .trim()
    .notEmpty()
    .withMessage("Designation is required")
    .isLength({ min: 1, max: 150 })
    .withMessage("Designation must be between 1 and 150 characters"),

  body("profile.age")
    .isInt({ min: 18, max: 100 })
    .withMessage("Age must be between 18 and 100"),

  body("profile.uniquePerspective")
    .trim()
    .notEmpty()
    .withMessage("Unique perspective is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Unique perspective must be between 10 and 500 characters"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

// Send message validation
const sendMessageValidation = [
  body("message")
    .isString()
    .withMessage("Message must be a string")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ min: 1, max: 10000 })
    .withMessage("Message content must be between 1 and 10,000 characters"),
];

// Add message validation (for manual message addition)
const addMessageValidation = [
  body("role")
    .isIn(MESSAGE_ROLES)
    .withMessage(`Role must be one of: ${MESSAGE_ROLES.join(", ")}`),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ min: 1, max: 10000 })
    .withMessage("Message content must be between 1 and 10,000 characters"),

  body("metadata")
    .optional()
    .isObject()
    .withMessage("Metadata must be an object"),

  body("metadata.tokenCount")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Token count must be a non-negative integer"),

  body("metadata.processingTime")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Processing time must be a non-negative integer"),

  body("metadata.model")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Model name must be between 1 and 100 characters"),
];

// Update chat validation
const updateChatValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Chat title must be between 1 and 200 characters"),

  body("status")
    .optional()
    .isIn(["active", "archived", "deleted"])
    .withMessage("Status must be 'active', 'archived', or 'deleted'"),

  body("settings")
    .optional()
    .isObject()
    .withMessage("Settings must be an object"),

  body("settings.maxMessages")
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage("Max messages must be between 1 and 500"),

  body("settings.autoArchive")
    .optional()
    .isBoolean()
    .withMessage("Auto archive must be a boolean"),

  body("settings.autoArchiveDays")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("Auto archive days must be between 1 and 365"),

  body("tags").optional().isArray().withMessage("Tags must be an array"),

  body("tags.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each tag must be between 1 and 50 characters"),
];

// Get chat validation (for chat ID parameter)
const getChatValidation = [
  param("chatId").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid chat ID format");
    }
    return true;
  }),
];

// Search messages validation
const searchMessagesValidation = [
  query("query")
    .trim()
    .notEmpty()
    .withMessage("Search query is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Search query must be between 1 and 200 characters"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

// Export chat validation
const exportChatValidation = [
  query("format")
    .optional()
    .isIn(["json", "txt", "csv"])
    .withMessage("Format must be 'json', 'txt', or 'csv'"),
];

// Get user chats validation (for query parameters)
const getUserChatsValidation = [
  query("status")
    .optional()
    .isIn(["active", "archived", "deleted"])
    .withMessage("Status must be 'active', 'archived', or 'deleted'"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
];

// Dashboard validation
const getDashboardValidation = [
  query("days")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("Days must be between 1 and 365"),
];

// Get prompts validation
const getPromptsValidation = [
  query("category")
    .optional()
    .isIn([
      "professional",
      "creative",
      "educational",
      "entertainment",
      "wellness",
      "technology",
      "business",
      "lifestyle",
      "other",
    ])
    .withMessage("Category must be one of the predefined values"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
];

// Prompt ID validation
const getPromptValidation = [
  param("promptId").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid prompt ID format");
    }
    return true;
  }),
];

// Handle validation errors middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.param || error.path,
      message: error.msg,
      value: error.value,
    }));

    const response = ApiResponse.error("Validation failed", 400, errorMessages);

    return res.status(response.statusCode).json(response);
  }
  next();
};

module.exports = {
  createChatValidation,
  sendMessageValidation,
  addMessageValidation,
  addPromptValidation,
  updateChatValidation,
  getChatValidation,
  getPromptValidation,
  getPromptsValidation,
  searchMessagesValidation,
  exportChatValidation,
  getUserChatsValidation,
  getDashboardValidation,
  handleValidationErrors,
};
