const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, "Message role is required"],
      enum: {
        values: ["user", "assistant", "system"],
        message: "Role must be either 'user', 'assistant', or 'system'",
      },
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [10000, "Message content cannot exceed 10,000 characters"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      // For storing additional info like token count, processing time, etc.
      tokenCount: {
        type: Number,
        min: [0, "Token count cannot be negative"],
      },
      processingTime: {
        type: Number, // in milliseconds
        min: [0, "Processing time cannot be negative"],
      },
      model: {
        type: String,
        trim: true,
      },
    },
  },
  {
    _id: true,
  }
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Chat title cannot exceed 200 characters"],
      default: function () {
        return `Chat ${new Date().toLocaleDateString()}`;
      },
    },
    messages: [messageSchema],
    status: {
      type: String,
      enum: {
        values: ["active", "archived", "deleted"],
        message: "Status must be 'active', 'archived', or 'deleted'",
      },
      default: "active",
    },
    settings: {
      // Chat-specific settings
      maxMessages: {
        type: Number,
        default: 100,
        min: [1, "Max messages must be at least 1"],
        max: [500, "Max messages cannot exceed 500"],
      },
      autoArchive: {
        type: Boolean,
        default: false,
      },
      autoArchiveDays: {
        type: Number,
        default: 30,
        min: [1, "Auto archive days must be at least 1"],
        max: [365, "Auto archive days cannot exceed 365"],
      },
    },
    statistics: {
      totalMessages: {
        type: Number,
        default: 0,
        min: [0, "Total messages cannot be negative"],
      },
      totalTokens: {
        type: Number,
        default: 0,
        min: [0, "Total tokens cannot be negative"],
      },
      lastActivity: {
        type: Date,
        default: Date.now,
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Tag cannot exceed 50 characters"],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, status: 1 });
chatSchema.index({ "statistics.lastActivity": -1 });
chatSchema.index({ tags: 1 });

// Virtual for message count
chatSchema.virtual("messageCount").get(function () {
  return this.messages.length;
});

// Virtual for latest message
chatSchema.virtual("latestMessage").get(function () {
  if (this.messages.length === 0) return null;
  return this.messages[this.messages.length - 1];
});

// Pre-save middleware to update statistics
chatSchema.pre("save", function (next) {
  if (this.isModified("messages")) {
    // Update total messages count
    this.statistics.totalMessages = this.messages.length;

    // Update total tokens count
    this.statistics.totalTokens = this.messages.reduce((total, message) => {
      return total + (message.metadata?.tokenCount || 0);
    }, 0);

    // Update last activity
    this.statistics.lastActivity = new Date();

    // Auto-generate title from first user message if not set
    if (!this.title || this.title.includes("Chat ")) {
      const firstUserMessage = this.messages.find((msg) => msg.role === "user");
      if (firstUserMessage) {
        // Take first 50 characters of the first user message as title
        this.title =
          firstUserMessage.content.substring(0, 50) +
          (firstUserMessage.content.length > 50 ? "..." : "");
      }
    }
  }
  next();
});

// Instance method to add a message
chatSchema.methods.addMessage = function (role, content, metadata = {}) {
  // Check if we've reached the max messages limit
  if (this.messages.length >= this.settings.maxMessages) {
    // Remove oldest messages to make room (keep system messages)
    const nonSystemMessages = this.messages.filter(
      (msg) => msg.role !== "system"
    );
    if (nonSystemMessages.length >= this.settings.maxMessages) {
      // Remove the oldest non-system message
      const oldestIndex = this.messages.findIndex(
        (msg) => msg.role !== "system"
      );
      if (oldestIndex !== -1) {
        this.messages.splice(oldestIndex, 1);
      }
    }
  }

  const newMessage = {
    role,
    content,
    metadata,
    timestamp: new Date(),
  };

  this.messages.push(newMessage);
  return this.messages[this.messages.length - 1];
};

// Instance method to get conversation history in ChatGPT format
chatSchema.methods.getConversationHistory = function (includeSystem = true) {
  return this.messages
    .filter((msg) => includeSystem || msg.role !== "system")
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    }));
};

// Static method to get user's active chats
chatSchema.statics.getUserActiveChats = function (userId, limit = 10) {
  return this.find({
    userId: new mongoose.Types.ObjectId(userId),
    status: "active",
  })
    .sort({ "statistics.lastActivity": -1 })
    .limit(limit)
    .populate("userId", "fullName email");
};

// Static method to archive old chats
chatSchema.statics.archiveOldChats = async function () {
  const chats = await this.find({
    status: "active",
    "settings.autoArchive": true,
  });

  const updates = [];
  const now = new Date();

  for (const chat of chats) {
    const daysSinceLastActivity = Math.floor(
      (now - chat.statistics.lastActivity) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActivity >= chat.settings.autoArchiveDays) {
      updates.push({
        updateOne: {
          filter: { _id: chat._id },
          update: { status: "archived" },
        },
      });
    }
  }

  if (updates.length > 0) {
    await this.bulkWrite(updates);
    return updates.length;
  }

  return 0;
};

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
