const express = require("express");
const ChatController = require("../controllers/ChatController");
const { authenticate } = require("../middleware/auth");
const { chatRateLimiter } = require("../middleware/security");
const {
  createChatValidation,
  sendMessageValidation,
  addMessageValidation,
  updateChatValidation,
  getChatValidation,
  searchMessagesValidation,
  exportChatValidation,
  handleValidationErrors,
} = require("../validators/chatValidators");

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

// Chat management routes
router.post(
  "/",
  chatRateLimiter,
  createChatValidation,
  handleValidationErrors,
  ChatController.createChat
);

router.get("/", ChatController.getUserChats);

router.get("/dashboard", ChatController.getDashboard);

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

// Message management routes
router.post(
  "/:chatId/messages",
  chatRateLimiter,
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
