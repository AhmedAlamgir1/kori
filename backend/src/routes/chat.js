const express = require("express");
const { body, query } = require("express-validator");
const ChatController = require("../controllers/ChatController");
const { chatRateLimiter } = require("../middleware/security");
const { authenticate, optionalAuth } = require("../middleware/auth");

const {
  createChatValidation,
  sendMessageValidation,
  addPromptValidation,
  addQuestionValidation,
  updateChatValidation,
  getChatValidation,
  getPromptValidation,
  getPromptsValidation,
  getQuestionValidation,
  searchMessagesValidation,
  exportChatValidation,
  getUserChatsValidation,
  getDashboardValidation,
  handleValidationErrors,
} = require("../validators/chatValidators");

const router = express.Router();

// Apply authentication to all routes (authentication required)
// router.use(authenticate);

// Chat management routes
router.post(
  "/",
  chatRateLimiter,
  createChatValidation,
  handleValidationErrors,
  authenticate,
  ChatController.createChat
);

router.get(
  "/",
  getUserChatsValidation,
  handleValidationErrors,
  authenticate,
  ChatController.getUserChats
);

router.get(
  "/all-with-data",
  query("status")
    .optional()
    .isIn(["active", "archived", "deleted"])
    .withMessage("Status must be one of: active, archived, deleted"),
  handleValidationErrors,
  authenticate,
  ChatController.getAllUserChatsWithData
);

router.get(
  "/search/initial-prompt",
  query("q")
    .trim()
    .notEmpty()
    .withMessage("Search query is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be between 1 and 100 characters"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  handleValidationErrors,
  authenticate,
  ChatController.searchByInitialPrompt
);

router.get(
  "/dashboard",
  getDashboardValidation,
  authenticate,
  handleValidationErrors,
  ChatController.getDashboard
);

// Session management routes
router.get("/session/current", authenticate, ChatController.getCurrentSession);

router.post(
  "/session/new",
  chatRateLimiter,
  createChatValidation,
  handleValidationErrors,
  authenticate,
  ChatController.startNewSession
);

router.get(
  "/:chatId",
  getChatValidation,
  handleValidationErrors,
  authenticate,
  ChatController.getChatById
);

router.patch(
  "/:chatId",
  getChatValidation,
  updateChatValidation,
  handleValidationErrors,
  authenticate,
  ChatController.updateChat
);

router.delete(
  "/:chatId",
  getChatValidation,
  handleValidationErrors,
  authenticate,
  ChatController.deleteChat
);

// Initial prompt management routes
router.put(
  "/:chatId/initial-prompt",
  getChatValidation,
  body("initialPrompt")
    .trim()
    .notEmpty()
    .withMessage("Initial prompt is required")
    .isLength({ min: 5, max: 1000 })
    .withMessage("Initial prompt must be between 5 and 1,000 characters"),
  handleValidationErrors,
  authenticate,
  ChatController.updateInitialPrompt
);

router.delete(
  "/:chatId/initial-prompt",
  getChatValidation,
  handleValidationErrors,
  authenticate,
  ChatController.removeInitialPrompt
);

// Prompt management routes
router.post(
  "/:chatId/prompts",
  chatRateLimiter,
  getChatValidation,
  // addPromptValidation,
  // handleValidationErrors,
  authenticate,
  ChatController.addPrompt
);

router.get(
  "/:chatId/prompts",
  getChatValidation,
  getPromptsValidation,
  handleValidationErrors,
  authenticate,
  ChatController.getChatPrompts
);

router.get(
  "/:chatId/prompts/:promptId",
  getChatValidation,
  getPromptValidation,
  handleValidationErrors,
  authenticate,
  ChatController.getPromptById
);

router.patch(
  "/:chatId/prompts/:promptId",
  getChatValidation,
  getPromptValidation,
  addPromptValidation,
  handleValidationErrors,
  authenticate,
  ChatController.updatePrompt
);

router.delete(
  "/:chatId/prompts/:promptId",
  getChatValidation,
  getPromptValidation,
  handleValidationErrors,
  authenticate,
  ChatController.deletePrompt
);

// Message management routes
router.post(
  "/:chatId/messages",
  chatRateLimiter,
  authenticate,
  getChatValidation,
  sendMessageValidation,
  handleValidationErrors,
  ChatController.sendMessage
);

router.get(
  "/:chatId/messages",
  getChatValidation,
  query("promptId")
    .optional()
    .isMongoId()
    .withMessage("Prompt ID must be a valid MongoDB ObjectId"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  handleValidationErrors,
  authenticate,
  ChatController.getMessages
);

router.get(
  "/:chatId/messages/search",
  getChatValidation,
  searchMessagesValidation,
  handleValidationErrors,
  authenticate,
  ChatController.searchMessages
);

// Chat utilities routes
router.get(
  "/:chatId/statistics",
  getChatValidation,
  handleValidationErrors,
  authenticate,
  ChatController.getChatStatistics
);

router.get(
  "/:chatId/export",
  getChatValidation,
  exportChatValidation,
  handleValidationErrors,
  authenticate,
  ChatController.exportChat
);

// Question management routes
router.post(
  "/:chatId/questions",
  getChatValidation,
  addQuestionValidation,
  handleValidationErrors,
  authenticate,
  ChatController.addQuestion
);

router.get(
  "/:chatId/questions",
  getChatValidation,
  query("category")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Category must be between 1 and 100 characters"),
  handleValidationErrors,
  authenticate,
  ChatController.getQuestions
);

router.patch(
  "/:chatId/questions/:questionId",
  getChatValidation,
  getQuestionValidation,
  addQuestionValidation,
  handleValidationErrors,
  authenticate,
  ChatController.updateQuestion
);

router.delete(
  "/:chatId/questions/:questionId",
  getChatValidation,
  getQuestionValidation,
  handleValidationErrors,
  authenticate,
  ChatController.deleteQuestion
);

module.exports = router;
