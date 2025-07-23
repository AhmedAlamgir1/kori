const Chat = require("../models/Chat");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const config = require("../config/config");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
let genAI;
if (config.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
}

class ChatService {
  // Create a new chat
  static async createChat(data) {
    const { userId, title, settings } = data;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const chat = new Chat({
      userId: new mongoose.Types.ObjectId(userId),
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      settings: {
        maxMessages: settings?.maxMessages || 100,
        autoArchive: settings?.autoArchive || false,
        autoArchiveDays: settings?.autoArchiveDays || 30,
      },
    });

    await chat.save();
    await chat.populate("userId", "fullName email");

    return chat;
  }

  // Get user's chats with pagination
  static async getUserChats(data) {
    const { userId, status = "active", page = 1, limit = 10 } = data;

    const skip = (page - 1) * limit;

    const filter = {
      userId: new mongoose.Types.ObjectId(userId),
      status,
    };

    const chats = await Chat.find(filter)
      .sort({ "statistics.lastActivity": -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName email")
      .select("-messages"); // Don't include messages in list view

    const total = await Chat.countDocuments(filter);

    return {
      chats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalChats: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  // Get specific chat by ID
  static async getChatById(data) {
    const { chatId, userId, includeMessages = true } = data;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw ApiError.badRequest("Invalid chat ID");
    }

    const query = Chat.findOne({
      _id: new mongoose.Types.ObjectId(chatId),
      userId: new mongoose.Types.ObjectId(userId),
    }).populate("userId", "fullName email");

    if (!includeMessages) {
      query.select("-messages");
    }

    const chat = await query;

    if (!chat) {
      throw ApiError.notFound("Chat not found");
    }

    return chat;
  }

  // Send message and get AI response
  static async sendMessage(data) {
    const { chatId, userId, userMessage } = data;

    const chat = await this.getChatById({ chatId, userId });

    // Add user message
    const userMsg = chat.addMessage("user", userMessage, {
      timestamp: new Date(),
    });

    // Here you would integrate with your AI service (ChatGPT, etc.)
    // For now, I'll create a mock response
    const aiResponse = await this.generateAIResponse(
      chat.getConversationHistory()
    );

    // Add AI response
    const aiMsg = chat.addMessage("assistant", aiResponse.content, {
      tokenCount: aiResponse.tokenCount,
      processingTime: aiResponse.processingTime,
      model: aiResponse.model,
    });

    await chat.save();

    return {
      chat,
      userMessage: userMsg,
      aiMessage: aiMsg,
    };
  }

  // Add message manually (for system messages or imports)
  static async addMessage(data) {
    const { chatId, userId, role, content, metadata } = data;

    if (!["user", "assistant", "system"].includes(role)) {
      throw ApiError.badRequest("Invalid message role");
    }

    const chat = await this.getChatById({ chatId, userId });

    const message = chat.addMessage(role, content, metadata || {});
    await chat.save();

    return {
      chat,
      message,
    };
  }

  // Update chat
  static async updateChat(data) {
    const { chatId, userId, updates } = data;

    const chat = await this.getChatById({
      chatId,
      userId,
      includeMessages: false,
    });

    // Allowed update fields
    const allowedUpdates = ["title", "settings", "tags", "status"];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        if (key === "settings" && typeof updates[key] === "object") {
          // Merge settings
          filteredUpdates[key] = { ...chat.settings, ...updates[key] };
        } else {
          filteredUpdates[key] = updates[key];
        }
      }
    }

    Object.assign(chat, filteredUpdates);
    await chat.save();

    return chat;
  }

  // Delete or archive chat
  static async deleteChat(data) {
    const { chatId, userId, permanent = false } = data;

    const chat = await this.getChatById({
      chatId,
      userId,
      includeMessages: false,
    });

    if (permanent) {
      await Chat.findByIdAndDelete(chatId);
    } else {
      chat.status = "deleted";
      await chat.save();
    }

    return true;
  }

  // Get chat statistics
  static async getChatStatistics(data) {
    const { chatId, userId } = data;

    const chat = await this.getChatById({ chatId, userId });

    const stats = {
      totalMessages: chat.statistics.totalMessages,
      totalTokens: chat.statistics.totalTokens,
      lastActivity: chat.statistics.lastActivity,
      messagesByRole: {
        user: chat.messages.filter((m) => m.role === "user").length,
        assistant: chat.messages.filter((m) => m.role === "assistant").length,
        system: chat.messages.filter((m) => m.role === "system").length,
      },
      averageResponseTime: this.calculateAverageResponseTime(chat.messages),
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };

    return stats;
  }

  // Search messages in chat
  static async searchMessages(data) {
    const { chatId, userId, searchQuery, page = 1, limit = 20 } = data;

    const chat = await this.getChatById({ chatId, userId });

    // Simple text search (you can enhance this with more sophisticated search)
    const matchingMessages = chat.messages.filter((message) =>
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const skip = (page - 1) * limit;
    const paginatedResults = matchingMessages.slice(skip, skip + limit);

    return {
      messages: paginatedResults,
      total: matchingMessages.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(matchingMessages.length / limit),
        hasNext: skip + limit < matchingMessages.length,
        hasPrev: page > 1,
      },
    };
  }

  // Export chat conversation
  static async exportChat(data) {
    const { chatId, userId, format = "json" } = data;

    const chat = await this.getChatById({ chatId, userId });

    const exportData = {
      chatId: chat._id,
      title: chat.title,
      createdAt: chat.createdAt,
      messages: chat.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        metadata: msg.metadata,
      })),
      statistics: chat.statistics,
    };

    let formattedData;

    switch (format.toLowerCase()) {
      case "txt":
        formattedData = this.formatChatAsText(exportData);
        break;
      case "csv":
        formattedData = this.formatChatAsCSV(exportData);
        break;
      case "json":
      default:
        formattedData = JSON.stringify(exportData, null, 2);
        break;
    }

    return formattedData;
  }

  // Get dashboard data
  static async getDashboardData(data) {
    const { userId, days = 7 } = data;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalChats: { $sum: 1 },
          totalMessages: { $sum: "$statistics.totalMessages" },
          totalTokens: { $sum: "$statistics.totalTokens" },
          activeChats: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
        },
      },
    ];

    const stats = await Chat.aggregate(pipeline);
    const dashboardStats = stats[0] || {
      totalChats: 0,
      totalMessages: 0,
      totalTokens: 0,
      activeChats: 0,
    };

    // Get recent chats
    const recentChats = await Chat.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: "active",
    })
      .sort({ "statistics.lastActivity": -1 })
      .limit(5)
      .select("title statistics.lastActivity statistics.totalMessages");

    return {
      ...dashboardStats,
      recentChats,
      period: `Last ${days} days`,
    };
  }

  // Helper method to generate AI response using Gemini AI
  static async generateAIResponse(conversationHistory) {
    const startTime = Date.now();

    try {
      if (!genAI) {
        // Fallback to mock responses if Gemini is not configured
        return this.generateMockResponse();
      }

      // Format conversation history for Gemini
      const contextPrompt = this.formatConversationForAI(conversationHistory);

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });

      const result = await model.generateContent(contextPrompt);
      const responseText = result.response.text();
      const processingTime = Date.now() - startTime;

      // Estimate token count (rough approximation)
      const tokenCount = Math.ceil(responseText.length / 4);

      return {
        content: responseText,
        tokenCount,
        processingTime,
        model: "gemini-1.5-flash",
      };
    } catch (error) {
      console.error("Gemini AI error:", error);

      // Fallback to mock response on error
      return this.generateMockResponse();
    }
  }

  // Helper method to format conversation for AI
  static formatConversationForAI(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return "Hello! How can I help you today?";
    }

    // Get the last few messages for context (limit to prevent token overflow)
    const recentMessages = conversationHistory.slice(-10);

    let prompt =
      "You are a helpful AI assistant. Here's our conversation so far:\n\n";

    recentMessages.forEach((msg, index) => {
      const speaker = msg.role === "user" ? "Human" : "Assistant";
      prompt += `${speaker}: ${msg.content}\n`;
    });

    prompt += "\nAssistant: ";

    return prompt;
  }

  // Fallback mock response method
  static async generateMockResponse() {
    // This is a mock implementation for when Gemini AI is not available
    const responses = [
      "That's an interesting question. Let me help you with that.",
      "I understand what you're asking. Here's what I think...",
      "Based on the context, I would suggest...",
      "That's a great point. Let me elaborate on that.",
      "I can help you with that. Here's my response...",
    ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      content: randomResponse,
      tokenCount: Math.floor(Math.random() * 100) + 20,
      processingTime: Math.floor(Math.random() * 1000) + 100,
      model: "mock-ai-model",
    };
  }

  // Helper method to calculate average response time
  static calculateAverageResponseTime(messages) {
    const pairs = [];

    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].role === "user" && messages[i + 1].role === "assistant") {
        const responseTime = messages[i + 1].timestamp - messages[i].timestamp;
        pairs.push(responseTime);
      }
    }

    if (pairs.length === 0) return 0;
    return pairs.reduce((sum, time) => sum + time, 0) / pairs.length;
  }

  // Helper method to format chat as text
  static formatChatAsText(chatData) {
    let text = `Chat: ${chatData.title}\n`;
    text += `Created: ${chatData.createdAt}\n\n`;

    chatData.messages.forEach((msg, index) => {
      text += `${index + 1}. [${msg.role.toUpperCase()}] (${msg.timestamp})\n`;
      text += `${msg.content}\n\n`;
    });

    return text;
  }

  // Helper method to format chat as CSV
  static formatChatAsCSV(chatData) {
    let csv = "Index,Role,Timestamp,Content,TokenCount\n";

    chatData.messages.forEach((msg, index) => {
      const content = msg.content.replace(/"/g, '""'); // Escape quotes
      const tokenCount = msg.metadata?.tokenCount || 0;
      csv += `${index + 1},"${msg.role}","${
        msg.timestamp
      }","${content}",${tokenCount}\n`;
    });

    return csv;
  }
}

module.exports = ChatService;
