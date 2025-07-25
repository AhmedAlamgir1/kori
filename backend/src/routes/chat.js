const express = require("express");
const ChatController = require("../controllers/ChatController");
const { chatRateLimiter } = require("../middleware/security");
const { authenticate, optionalAuth } = require("../middleware/auth");

const {
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
  "/dashboard",
  getDashboardValidation,
  authenticate,
  handleValidationErrors,
  ChatController.getDashboard
);

router.get(
  "/:chatId",
  getChatValidation,
  handleValidationErrors,
  ChatController.getChatById
);

router.patch(
  "/:chatId",
  getChatValidation,
  updateChatValidation,
  handleValidationErrors,
  ChatController.updateChat
);

router.delete(
  "/:chatId",
  getChatValidation,
  handleValidationErrors,
  ChatController.deleteChat
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
  ChatController.getChatPrompts
);

router.get(
  "/:chatId/prompts/:promptId",
  getChatValidation,
  getPromptValidation,
  handleValidationErrors,
  ChatController.getPromptById
);

router.patch(
  "/:chatId/prompts/:promptId",
  getChatValidation,
  getPromptValidation,
  addPromptValidation,
  handleValidationErrors,
  ChatController.updatePrompt
);

router.delete(
  "/:chatId/prompts/:promptId",
  getChatValidation,
  getPromptValidation,
  handleValidationErrors,
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

router.post(
  "/:chatId/messages/add",
  getChatValidation,
  addMessageValidation,
  handleValidationErrors,
  authenticate,
  ChatController.addMessage
);

router.get(
  "/:chatId/messages/search",
  getChatValidation,
  searchMessagesValidation,
  handleValidationErrors,
  ChatController.searchMessages
);

// Chat utilities routes
router.get(
  "/:chatId/statistics",
  getChatValidation,
  handleValidationErrors,
  ChatController.getChatStatistics
);

router.get(
  "/:chatId/export",
  getChatValidation,
  exportChatValidation,
  handleValidationErrors,
  ChatController.exportChat
);

module.exports = router;
