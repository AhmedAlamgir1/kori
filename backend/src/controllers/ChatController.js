const ChatService = require("../services/ChatService");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

class ChatController {
  // Create a new chat
  static async createChat(req, res, next) {
    try {
      const { title, settings } = req.body;

      let chat;

      if (req.user) {
        console.log("req.user", req.user);
        const userId = req.user ? req.user._id : null;

        chat = await ChatService.createChat({
          userId,
          title,
          settings,
        });
      }

      const response = ApiResponse.success(
        "Chat created successfully",
        { chat },
        201
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get all user's chats
  static async getUserChats(req, res, next) {
    try {
      const userId = req.user ? req.user._id : null;

      const { status = "active", page = 1, limit = 10 } = req.query;
      // Ensure userId is provided (authentication required)
      if (!userId) {
        return next(new ApiError("Authentication is required", 401));
      }

      const chats = await ChatService.getUserChats({
        userId,
        status,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      const response = ApiResponse.success(
        "Chats retrieved successfully",
        chats
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get specific chat by ID
  static async getChatById(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId } = req.params;
      const { includeMessages = true } = req.query;

      const chat = await ChatService.getChatById({
        chatId,
        userId,
        includeMessages: includeMessages === "true",
      });

      const response = ApiResponse.success("Chat retrieved successfully", {
        chat,
      });

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Send message to chat (user message + AI response)
  static async sendMessage(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId } = req.params;
      const { message } = req.body;

      // Debug logging to help identify the issue
      console.log(
        "ChatController.sendMessage - Raw message:",
        typeof message,
        message
      );

      const result = await ChatService.sendMessage({
        chatId,
        userId,
        userMessage: message,
      });

      const response = ApiResponse.success("Message sent successfully", result);

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Add message to chat (manual message addition)
  static async addMessage(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId } = req.params;
      const { role, content, metadata } = req.body;

      const result = await ChatService.addMessage({
        chatId,
        userId,
        role,
        content,
        metadata,
      });

      const response = ApiResponse.success(
        "Message added successfully",
        result
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Update chat settings
  static async updateChat(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId } = req.params;
      const updates = req.body;

      const chat = await ChatService.updateChat({
        chatId,
        userId,
        updates,
      });

      const response = ApiResponse.success("Chat updated successfully", {
        chat,
      });

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Delete or archive chat
  static async deleteChat(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId } = req.params;
      const { permanent = false } = req.query;

      await ChatService.deleteChat({
        chatId,
        userId,
        permanent: permanent === "true",
      });

      const response = ApiResponse.success(
        permanent ? "Chat deleted permanently" : "Chat archived successfully",
        null
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get chat statistics
  static async getChatStatistics(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId } = req.params;

      const stats = await ChatService.getChatStatistics({
        chatId,
        userId,
      });

      const response = ApiResponse.success(
        "Chat statistics retrieved successfully",
        { statistics: stats }
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Search in chat messages
  static async searchMessages(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId } = req.params;
      const { query, page = 1, limit = 20 } = req.query;

      const results = await ChatService.searchMessages({
        chatId,
        userId,
        searchQuery: query,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      const response = ApiResponse.success(
        "Messages search completed",
        results
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Export chat conversation
  static async exportChat(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId } = req.params;
      const { format = "json" } = req.query; // json, txt, csv

      const exportData = await ChatService.exportChat({
        chatId,
        userId,
        format,
      });

      // Set appropriate headers for download
      const filename = `chat-${chatId}-${
        new Date().toISOString().split("T")[0]
      }.${format}`;

      if (format === "json") {
        res.setHeader("Content-Type", "application/json");
      } else if (format === "txt") {
        res.setHeader("Content-Type", "text/plain");
      } else if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
      }

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      const response = ApiResponse.success("Chat exported successfully", {
        exportData,
        filename,
      });

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get user's chat dashboard data
  static async getDashboard(req, res, next) {
    try {
      const userId = req.user ? req.user._id : null;

      // Ensure either userId or sessionId is provided
      if (!userId) {
        return next(
          new ApiError("Either authentication or sessionId is required", 400)
        );
      }
      const days = req.params.days ? parseInt(req.params.days) : 30; // Default to 30 days if not specified
      console.log("req.params.days", days);

      const dashboardData = await ChatService.getDashboardData({
        userId,
        days,
      });

      const response = ApiResponse.success(
        "Dashboard data retrieved successfully",
        dashboardData
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Add a prompt to a chat
  static async addPrompt(req, res, next) {
    try {
      const { chatId } = req.params;

      // Ensure either userId or sessionId is provided
      if (!req.user) {
        const response = ApiResponse.success("Prompt added successfully", 201);

        res.status(response.statusCode).json(response);
      }
      const promptData = { ...req.body, userId: req.userId };
      const userId = req.user ? req.user._id : null;
      if (!userId) {
        return next(
          new ApiError("Either authentication or sessionId is required", 400)
        );
      }

      const prompt = await ChatService.addPrompt({
        chatId,
        userId,
        promptData,
      });

      const response = ApiResponse.success(
        "Prompt added successfully",
        { prompt },
        201
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get all prompts in a chat
  static async getChatPrompts(req, res, next) {
    try {
      const userId = req.user ? req.user._id : null;
      const { chatId } = req.params;

      // Ensure either userId or sessionId is provided
      if (!userId && !sessionId) {
        return next(
          new ApiError("Either authentication or sessionId is required", 400)
        );
      }

      const prompts = await ChatService.getChatPrompts({
        chatId,
        userId,
        sessionId,
        category,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      const response = ApiResponse.success(
        "Prompts retrieved successfully",
        prompts
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get specific prompt by ID
  static async getPromptById(req, res, next) {
    try {
      const userId = req.user ? req.user._id : null;
      const { chatId, promptId } = req.params;

      // Ensure either userId or sessionId is provided
      if (!userId && !sessionId) {
        return next(
          new ApiError("Either authentication or sessionId is required", 400)
        );
      }

      const prompt = await ChatService.getPromptById({
        chatId,
        promptId,
        userId,
        sessionId,
      });

      const response = ApiResponse.success("Prompt retrieved successfully", {
        prompt,
      });

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Update a prompt
  static async updatePrompt(req, res, next) {
    try {
      const userId = req.user ? req.user._id : null;
      const { chatId, promptId } = req.params;

      const updateData = req.body;

      // Ensure either userId or sessionId is provided
      if (!userId && !sessionId) {
        return next(
          new ApiError("Either authentication or sessionId is required", 400)
        );
      }

      const prompt = await ChatService.updatePrompt({
        chatId,
        promptId,
        userId,
        sessionId,
        updateData,
      });

      const response = ApiResponse.success("Prompt updated successfully", {
        prompt,
      });

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Delete/deactivate a prompt
  static async deletePrompt(req, res, next) {
    try {
      const userId = req.user ? req.user._id : null;
      const { chatId, promptId } = req.params;

      // Ensure either userId or sessionId is provided
      if (!userId && !sessionId) {
        return next(
          new ApiError("Either authentication or sessionId is required", 400)
        );
      }

      await ChatService.deletePrompt({
        chatId,
        promptId,
        userId,
        sessionId,
      });

      const response = ApiResponse.success("Prompt deleted successfully");

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ChatController;
