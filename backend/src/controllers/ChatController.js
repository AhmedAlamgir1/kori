const ChatService = require("../services/ChatService");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

class ChatController {
  // Create a new chat
  static async createChat(req, res, next) {
    try {
      const { settings, initialPrompt, category } = req.body;

      let chat;

      if (req.user) {
        console.log("req.user", req.user);
        const userId = req.user ? req.user._id : null;

        chat = await ChatService.createChat({
          userId,
          settings,
          initialPrompt,
          category,
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

  // Get all user's chats with complete data including messages
  static async getAllUserChatsWithData(req, res, next) {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user._id) {
        return next(new ApiError("Authentication is required", 401));
      }

      const userId = req.user._id;
      const { status = "active" } = req.query;

      const chatsData = await ChatService.getAllUserChatsWithData({
        userId,
        status,
      });

      const response = ApiResponse.success(
        "All user chats with data retrieved successfully",
        chatsData
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Search chats by initial prompt
  static async searchByInitialPrompt(req, res, next) {
    try {
      const userId = req.user._id;
      const { q: searchText, limit = 10 } = req.query;

      const chats = await ChatService.searchByInitialPrompt({
        searchText,
        userId,
        limit: parseInt(limit),
      });

      const response = ApiResponse.success("Chats found", {
        chats,
        count: chats.length,
      });

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

  // Get user's current active session
  static async getCurrentSession(req, res, next) {
    try {
      const userId = req.user._id;

      const activeSession = await ChatService.getCurrentSession(userId);

      if (!activeSession) {
        const response = ApiResponse.success("No active session found", null);
        return res.status(response.statusCode).json(response);
      }

      const response = ApiResponse.success(
        "Active session retrieved successfully",
        { session: activeSession }
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Start a new session (archives current active session if exists)
  static async startNewSession(req, res, next) {
    try {
      const { settings, initialPrompt, category } = req.body;
      const userId = req.user._id;

      const newSession = await ChatService.startNewSession({
        userId,
        settings,
        initialPrompt,
        category,
      });

      const response = ApiResponse.success(
        "New session started successfully",
        { session: newSession },
        201
      );

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
      const { message, promptId, reset = false } = req.body;

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
        promptId,
        reset,
      });

      const response = ApiResponse.success("Message sent successfully", result);

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get messages for a chat
  static async getMessages(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId } = req.params;
      const { promptId, page = 1, limit = 50 } = req.query;

      const result = await ChatService.getMessages({
        chatId,
        userId,
        promptId,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      const response = ApiResponse.success(
        "Messages retrieved successfully",
        result
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get messages for a chat
  static async getMessages(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId } = req.params;
      const { promptId, page = 1, limit = 50 } = req.query;

      const result = await ChatService.getMessages({
        chatId,
        userId,
        promptId,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      const response = ApiResponse.success(
        "Messages retrieved successfully",
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

      await ChatService.deleteChat({
        chatId,
        userId,
      });

      const response = ApiResponse.success("Chat deleted successfully");

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Update initial prompt for a chat
  static async updateInitialPrompt(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId } = req.params;
      const { initialPrompt } = req.body;

      const chat = await ChatService.updateChat({
        chatId,
        userId,
        updates: { initialPrompt },
      });

      const response = ApiResponse.success(
        "Initial prompt updated successfully",
        {
          chat,
        }
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Remove initial prompt from a chat
  static async removeInitialPrompt(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId } = req.params;

      const chat = await ChatService.updateChat({
        chatId,
        userId,
        updates: { initialPrompt: null },
      });

      const response = ApiResponse.success(
        "Initial prompt removed successfully",
        {
          chat,
        }
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get chat statistics
  static async getChatStatistics(req, res, next) {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user._id) {
        return next(new ApiError("Authentication is required", 401));
      }

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
      const { query, page = 1, limit = 20, promptId } = req.query;

      const results = await ChatService.searchMessages({
        chatId,
        userId,
        searchQuery: query,
        page: parseInt(page),
        limit: parseInt(limit),
        promptId,
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
      // Ensure user is authenticated
      if (!req.user || !req.user._id) {
        return next(new ApiError("Authentication is required", 401));
      }

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
      const { chatId, questions } = req.params;

      const promptData = {
        ...req.body,
        userId: req.userId,
        questions: questions,
      };
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

  // Add a question to a prompt
  static async addQuestion(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId, promptId } = req.params;
      const { category, question } = req.body;

      const result = await ChatService.addQuestion({
        chatId,
        userId,
        promptId,
        questionData: { category, question },
      });

      const response = ApiResponse.success("Question added successfully", {
        question: result,
      });

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get questions for a prompt
  static async getQuestions(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId, promptId } = req.params;
      const { category } = req.query;

      const result = await ChatService.getQuestions({
        chatId,
        userId,
        promptId,
        category,
      });

      const response = ApiResponse.success(
        "Questions retrieved successfully",
        result
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Update a question
  static async updateQuestion(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId, promptId, questionId } = req.params;
      const updateData = req.body;

      const result = await ChatService.updateQuestion({
        chatId,
        promptId,
        questionId,
        userId,
        updateData,
      });

      const response = ApiResponse.success("Question updated successfully", {
        question: result,
      });

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Delete a question
  static async deleteQuestion(req, res, next) {
    try {
      const userId = req.user._id;
      const { chatId, promptId, questionId } = req.params;

      await ChatService.deleteQuestion({
        chatId,
        promptId,
        questionId,
        userId,
      });

      const response = ApiResponse.success("Question deleted successfully");

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ChatController;
