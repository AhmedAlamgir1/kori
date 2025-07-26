const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const config = require("../config/config");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MESSAGE_ROLES } = require("../constants/messageRoles");

// Initialize Gemini AI
let genAI;
if (config.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
}

class ChatService {
  // Create a new chat
  static async createChat(data) {
    const { userId, title, settings, initialPrompt } = data;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const chat = new Chat({
      userId: new mongoose.Types.ObjectId(userId),
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      initialPrompt,
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

  // Get all user chats with complete data including messages
  static async getAllUserChatsWithData(data) {
    const { userId, status = "active" } = data;

    const filter = {
      userId: new mongoose.Types.ObjectId(userId),
      status,
    };

    // Get all chats for the user
    const chats = await Chat.find(filter)
      .sort({ updatedAt: -1 })
      .populate("userId", "fullName email");

    // Get all messages for all chats in one query for efficiency
    const chatIds = chats.map((chat) => chat._id);
    const allMessages = await Message.find({
      chatId: { $in: chatIds },
      deleted: false,
    }).sort({ chatId: 1, timestamp: 1 });

    // Group messages by chatId for easy lookup
    const messagesByChat = {};
    allMessages.forEach((message) => {
      const chatId = message.chatId.toString();
      if (!messagesByChat[chatId]) {
        messagesByChat[chatId] = [];
      }
      messagesByChat[chatId].push(message);
    });

    // Attach messages to each chat and calculate basic statistics
    const chatsWithData = chats.map((chat) => {
      const chatObj = chat.toObject();
      const chatId = chat._id.toString();
      const messages = messagesByChat[chatId] || [];

      // Add messages to chat
      chatObj.messages = messages;

      // Calculate basic statistics
      const totalMessages = messages.length;
      const userMessages = messages.filter((m) => m.role === "user").length;
      const assistantMessages = messages.filter(
        (m) => m.role === "assistant"
      ).length;
      const systemMessages = messages.filter((m) => m.role === "system").length;

      const totalTokens = messages.reduce((total, message) => {
        return total + (message.metadata?.tokenCount || 0);
      }, 0);

      const lastActivity =
        messages.length > 0
          ? new Date(Math.max(...messages.map((m) => new Date(m.timestamp))))
          : chat.updatedAt;

      chatObj.statistics = {
        totalMessages,
        totalTokens,
        lastActivity,
        messagesByRole: {
          user: userMessages,
          assistant: assistantMessages,
          system: systemMessages,
        },
      };

      return chatObj;
    });

    return {
      chats: chatsWithData,
      summary: {
        totalChats: chatsWithData.length,
        totalMessages: chatsWithData.reduce(
          (sum, chat) => sum + chat.statistics.totalMessages,
          0
        ),
        totalTokens: chatsWithData.reduce(
          (sum, chat) => sum + chat.statistics.totalTokens,
          0
        ),
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
    const { chatId, userId, userMessage, promptId = null } = data;

    const chat = await this.getChatById({ chatId, userId });

    // If no promptId provided, try to get the first active prompt or create a default one
    let activePromptId = promptId;
    if (!activePromptId) {
      const activePrompts = chat.activePrompts;
      if (activePrompts.length > 0) {
        activePromptId = activePrompts[0]._id;
      } else {
        // Create a default prompt if none exists
        const defaultPrompt = chat.addPrompt({
          background: "General conversation",
          category: "other",
          profile: {
            name: "Assistant",
            designation: "AI Helper",
          },
          isActive: true,
        });
        await chat.save();
        activePromptId = defaultPrompt._id;
      }
    }

    // Use a default thread ID for main conversation
    const threadId = "main";

    // Ensure userMessage is a string (defensive programming)
    let messageContent = userMessage;
    if (typeof userMessage === "object" && userMessage !== null) {
      // If it's an object, try to extract text content
      messageContent =
        userMessage.text ||
        userMessage.content ||
        userMessage.message ||
        JSON.stringify(userMessage);
    } else if (typeof userMessage !== "string") {
      messageContent = String(userMessage);
    }

    // Add user message (role is always "user" for sendMessage)
    const userMsg = await chat.addMessage(
      activePromptId,
      threadId,
      "user",
      messageContent,
      {
        timestamp: new Date(),
      }
    );

    return {
      chat,
      userMessage: userMsg,
      promptId: activePromptId,
    };
  }

  // Add message manually (for system messages or imports)
  static async addMessage(data) {
    const { chatId, userId, role, content, metadata, promptId = null } = data;

    if (!MESSAGE_ROLES.includes(role)) {
      throw ApiError.badRequest(
        `Invalid message role. Allowed roles: ${MESSAGE_ROLES.join(", ")}`
      );
    }

    const chat = await this.getChatById({ chatId, userId });

    // If no promptId provided, try to get the first active prompt
    let activePromptId = promptId;
    if (!activePromptId) {
      const activePrompts = chat.activePrompts;
      if (activePrompts.length > 0) {
        activePromptId = activePrompts[0]._id;
      } else {
        throw ApiError.badRequest(
          "No active prompt found. Please provide promptId or create a prompt first."
        );
      }
    }

    // Use a default thread ID for main conversation
    const threadId = "main";

    const message = await chat.addMessage(
      activePromptId,
      threadId,
      role,
      content,
      metadata || {}
    );

    return {
      chat,
      message,
      promptId: activePromptId,
    };
  }

  // Get messages for a chat
  static async getMessages(data) {
    const { chatId, userId, promptId = null, page = 1, limit = 50 } = data;

    const chat = await this.getChatById({ chatId, userId });

    const options = {
      includeDeleted: false,
      limit,
      page,
    };

    let messageThreads;
    if (promptId) {
      // Get messages for specific prompt
      messageThreads = await Message.getMessagesByPrompt(
        chatId,
        promptId,
        options
      );
    } else {
      // Get all messages for the chat
      messageThreads = await Message.getMessagesByChat(chatId, options);
    }

    // Count total messages
    const totalQuery = { chatId, deleted: false };
    if (promptId) {
      totalQuery.promptId = promptId;
    }
    const total = await Message.countDocuments(totalQuery);

    return {
      messages: messageThreads,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      chat,
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
    const allowedUpdates = [
      "title",
      "settings",
      "tags",
      "status",
      "initialPrompt",
    ];
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

  // Search chats by initial prompt
  static async searchByInitialPrompt(data) {
    const { searchText, userId, limit = 10 } = data;

    const chats = await Chat.searchByInitialPrompt(searchText, {
      userId,
      limit,
    });

    return chats;
  }

  // Get chat statistics
  static async getChatStatistics(data) {
    const { chatId, userId } = data;

    // Get chat with populated messages for statistics
    const chat = await this.getChatById({
      chatId,
      userId,
      includeMessages: true,
    });

    // Also get all messages for this chat from the Message collection
    const Message = require("../models/Message");
    const messages = await Message.find({
      chatId: new mongoose.Types.ObjectId(chatId),
      deleted: false,
    }).sort({ timestamp: 1 });

    // Calculate statistics dynamically
    const totalMessages = messages.length;
    const userMessages = messages.filter((m) => m.role === "user").length;
    const assistantMessages = messages.filter(
      (m) => m.role === "assistant"
    ).length;
    const systemMessages = messages.filter((m) => m.role === "system").length;

    // Calculate total tokens (using metadata.tokenCount from messages)
    const totalTokens = messages.reduce((total, message) => {
      return total + (message.metadata?.tokenCount || 0);
    }, 0);

    // Get last activity from the most recent message or chat update
    const lastActivity =
      messages.length > 0
        ? new Date(Math.max(...messages.map((m) => new Date(m.timestamp))))
        : chat.updatedAt;

    const stats = {
      totalMessages,
      totalTokens,
      lastActivity,
      messagesByRole: {
        user: userMessages,
        assistant: assistantMessages,
        system: systemMessages,
      },
      averageResponseTime: this.calculateAverageResponseTime(messages),
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };

    return stats;
  }

  // Search messages in chat
  static async searchMessages(data) {
    const {
      chatId,
      userId,
      searchQuery,
      page = 1,
      limit = 20,
      promptId = null,
    } = data;

    const chat = await this.getChatById({ chatId, userId });

    // Search messages using the Message model
    const searchOptions = {
      chatId,
      limit,
      page,
    };

    if (promptId) {
      searchOptions.promptId = promptId;
    }

    if (userId) {
      searchOptions.userId = userId;
    }

    const messageThreads = await Message.searchMessages(
      searchQuery,
      searchOptions
    );

    // Extract individual messages from threads
    const allMessages = [];
    messageThreads.forEach((thread) => {
      thread.messages.forEach((msg) => {
        if (msg.content.toLowerCase().includes(searchQuery.toLowerCase())) {
          allMessages.push({
            ...msg.toObject(),
            threadId: thread.threadId,
            promptId: thread.promptId,
            chatId: thread.chatId,
          });
        }
      });
    });

    const total = await Message.countDocuments({
      chatId,
      ...(promptId && { promptId }),
      ...(userId && { userId }),
      deleted: false,
      "messages.content": { $regex: searchQuery, $options: "i" },
    });

    return {
      messages: allMessages,
      total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
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
    const { userId, sessionId, days = 7 } = data;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let matchFilter = { createdAt: { $gte: startDate } };

    if (userId) {
      matchFilter.userId = new mongoose.Types.ObjectId(userId);
    } else if (sessionId) {
      matchFilter.sessionId = sessionId;
    } else {
      throw ApiError.badRequest("Either userId or sessionId must be provided");
    }

    const pipeline = [
      {
        $match: matchFilter,
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
    let recentChatsFilter = { status: "active" };

    if (userId) {
      recentChatsFilter.userId = new mongoose.Types.ObjectId(userId);
    } else if (sessionId) {
      recentChatsFilter.sessionId = sessionId;
    }

    const recentChats = await Chat.find(recentChatsFilter)
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

  // Add a prompt to a chat
  static async addPrompt(data) {
    const { chatId, userId, promptData } = data;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw ApiError.badRequest("Invalid chat ID");
    }

    let filter = { _id: new mongoose.Types.ObjectId(chatId) };

    if (userId) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    } else {
      throw ApiError.badRequest("Either userId or sessionId must be provided");
    }

    const chat = await Chat.findOne(filter);

    if (!chat) {
      throw ApiError.notFound("Chat not found");
    }

    const prompt = chat.addPrompt(promptData);
    await chat.save();

    return prompt;
  }

  // Get prompts in a chat
  static async getChatPrompts(data) {
    const { chatId, userId, sessionId, category, page = 1, limit = 10 } = data;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw ApiError.badRequest("Invalid chat ID");
    }

    let filter = { _id: new mongoose.Types.ObjectId(chatId) };

    if (userId) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    } else if (sessionId) {
      filter.sessionId = sessionId;
    } else {
      throw ApiError.badRequest("Either userId or sessionId must be provided");
    }

    const chat = await Chat.findOne(filter);

    if (!chat) {
      throw ApiError.notFound("Chat not found");
    }

    let prompts = chat.prompts.filter((prompt) => prompt.isActive);

    if (category) {
      prompts = prompts.filter((prompt) => prompt.category === category);
    }

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedPrompts = prompts.slice(skip, skip + limit);

    return {
      prompts: paginatedPrompts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(prompts.length / limit),
        totalPrompts: prompts.length,
        hasNext: page * limit < prompts.length,
        hasPrev: page > 1,
      },
    };
  }

  // Get specific prompt by ID
  static async getPromptById(data) {
    const { chatId, promptId, userId, sessionId } = data;

    if (
      !mongoose.Types.ObjectId.isValid(chatId) ||
      !mongoose.Types.ObjectId.isValid(promptId)
    ) {
      throw ApiError.badRequest("Invalid chat ID or prompt ID");
    }

    let filter = { _id: new mongoose.Types.ObjectId(chatId) };

    if (userId) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    } else if (sessionId) {
      filter.sessionId = sessionId;
    } else {
      throw ApiError.badRequest("Either userId or sessionId must be provided");
    }

    const chat = await Chat.findOne(filter);

    if (!chat) {
      throw ApiError.notFound("Chat not found");
    }

    const prompt = chat.prompts.id(promptId);

    if (!prompt || !prompt.isActive) {
      throw ApiError.notFound("Prompt not found");
    }

    return prompt;
  }

  // Update a prompt
  static async updatePrompt(data) {
    const { chatId, promptId, userId, sessionId, updateData } = data;

    if (
      !mongoose.Types.ObjectId.isValid(chatId) ||
      !mongoose.Types.ObjectId.isValid(promptId)
    ) {
      throw ApiError.badRequest("Invalid chat ID or prompt ID");
    }

    let filter = { _id: new mongoose.Types.ObjectId(chatId) };

    if (userId) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    } else if (sessionId) {
      filter.sessionId = sessionId;
    } else {
      throw ApiError.badRequest("Either userId or sessionId must be provided");
    }

    const chat = await Chat.findOne(filter);

    if (!chat) {
      throw ApiError.notFound("Chat not found");
    }

    const prompt = chat.prompts.id(promptId);

    if (!prompt || !prompt.isActive) {
      throw ApiError.notFound("Prompt not found");
    }

    // Update prompt fields
    Object.keys(updateData).forEach((key) => {
      if (key === "profile" && typeof updateData[key] === "object") {
        Object.keys(updateData[key]).forEach((profileKey) => {
          prompt.profile[profileKey] = updateData[key][profileKey];
        });
      } else if (key !== "_id" && key !== "userId") {
        prompt[key] = updateData[key];
      }
    });

    await chat.save();

    return prompt;
  }

  // Delete/deactivate a prompt
  static async deletePrompt(data) {
    const { chatId, promptId, userId, sessionId } = data;

    if (
      !mongoose.Types.ObjectId.isValid(chatId) ||
      !mongoose.Types.ObjectId.isValid(promptId)
    ) {
      throw ApiError.badRequest("Invalid chat ID or prompt ID");
    }

    let filter = { _id: new mongoose.Types.ObjectId(chatId) };

    if (userId) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    } else if (sessionId) {
      filter.sessionId = sessionId;
    } else {
      throw ApiError.badRequest("Either userId or sessionId must be provided");
    }

    const chat = await Chat.findOne(filter);

    if (!chat) {
      throw ApiError.notFound("Chat not found");
    }

    const prompt = chat.deactivatePrompt(promptId);

    if (!prompt) {
      throw ApiError.notFound("Prompt not found");
    }

    await chat.save();

    return true;
  }
}

module.exports = ChatService;
