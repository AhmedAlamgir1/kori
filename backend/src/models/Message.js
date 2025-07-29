const mongoose = require("mongoose");
const { MESSAGE_ROLES } = require("../constants/messageRoles");

// Individual message schema for to/from messages within a conversation thread
const individualMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [false, "Message role is required"],
      enum: {
        values: MESSAGE_ROLES,
        message: `Role must be one of: ${MESSAGE_ROLES.join(", ")}`,
      },
    },
    content: {
      type: String,
      required: [false, "Message content is required"],
      trim: true,
      maxlength: [10000, "Message content cannot exceed 10,000 characters"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

// Main Message collection schema
const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: [true, "Chat ID is required"],
      index: true,
    },
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Prompt ID is required"],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for unauthenticated users
      index: true,
    },
    messages: [individualMessageSchema], // Array of to/from messages
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for better query performance
messageSchema.index({ chatId: 1, promptId: 1 });
messageSchema.index({ chatId: 1, deleted: 1, updatedAt: -1 });
messageSchema.index({ promptId: 1, deleted: 1, updatedAt: -1 });
messageSchema.index({ userId: 1, createdAt: -1 });

// Virtual for message count in this thread
messageSchema.virtual("messageCount").get(function () {
  return this.messages.length;
});

// Virtual for latest message timestamp
messageSchema.virtual("latestMessageTimestamp").get(function () {
  if (this.messages.length === 0) return null;
  return this.messages[this.messages.length - 1].timestamp;
});

// Instance method to add a message to this thread
messageSchema.methods.addMessage = function (role, content) {
  const newMessage = {
    role,
    content,
    timestamp: new Date(),
  };

  this.messages.push(newMessage);
  return this.messages[this.messages.length - 1];
};

// Instance method to add multiple messages to this thread
messageSchema.methods.addMessages = function (messages) {
  const formattedMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
    timestamp: new Date(),
  }));

  this.messages.push(...formattedMessages);
  return this.messages.slice(-formattedMessages.length);
};

// Instance method to soft delete this message thread
messageSchema.methods.softDelete = function () {
  this.deleted = true;
  return this.save();
};

// Static method to get messages by chat and prompt
messageSchema.statics.getMessagesByPrompt = function (
  chatId,
  promptId,
  options = {}
) {
  const { includeDeleted = false, limit = 50, page = 1 } = options;

  const query = { chatId, promptId };
  if (!includeDeleted) {
    query.deleted = false;
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "fullName email");
};

// Static method to get messages by chat
messageSchema.statics.getMessagesByChat = function (chatId, options = {}) {
  const { includeDeleted = false, limit = 50, page = 1 } = options;

  const query = { chatId };
  if (!includeDeleted) {
    query.deleted = false;
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "fullName email");
};

// Static method to search messages
messageSchema.statics.searchMessages = function (searchQuery, options = {}) {
  const { chatId, promptId, userId, limit = 20, page = 1 } = options;

  const query = {
    deleted: false,
    "messages.content": { $regex: searchQuery, $options: "i" },
  };

  if (chatId) query.chatId = chatId;
  if (promptId) query.promptId = promptId;
  if (userId) query.userId = userId;

  const skip = (page - 1) * limit;

  return this.find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "fullName email");
};

// Static method to get conversation history for a prompt
messageSchema.statics.getConversationHistory = function (
  chatId,
  promptId,
  options = {}
) {
  const { includeSystem = true, latestOnly = true, limit = 100 } = options;

  const query = { chatId, promptId, deleted: false };

  return this.find(query)
    .sort({ updatedAt: latestOnly ? -1 : 1 })
    .limit(latestOnly ? 1 : limit)
    .then((messageThreads) => {
      if (latestOnly && messageThreads.length > 0) {
        // Return messages from the latest thread only
        const latestThread = messageThreads[0];
        return latestThread.messages
          .filter((msg) => includeSystem || msg.role !== "system")
          .map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          }));
      } else {
        // Return all messages from all threads
        const allMessages = [];
        messageThreads.forEach((thread) => {
          thread.messages
            .filter((msg) => includeSystem || msg.role !== "system")
            .forEach((msg) => {
              allMessages.push({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
              });
            });
        });

        return allMessages.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
      }
    });
};

// Static method to clear all messages for a chat and prompt
messageSchema.statics.clearMessagesForPrompt = function (chatId, promptId) {
  return this.updateMany(
    { chatId, promptId, deleted: false },
    { deleted: true }
  );
};

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
