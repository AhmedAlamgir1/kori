const mongoose = require("mongoose");
const { MESSAGE_ROLES } = require("../constants/messageRoles");

// Individual message schema for to/from messages within a conversation thread
const individualMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, "Message role is required"],
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

// Message thread schema that contains multiple to/from messages
const messageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Message thread ID is required"],
      trim: true,
    },
    messages: [individualMessageSchema], // Array of to/from messages
    deleted: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

// Prompt schema for AI character-based conversations
const promptSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: false, // Made optional
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow null/undefined
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: "Invalid image URL format",
      },
    },
    background: {
      type: String,
      required: false, // Made optional
      trim: true,
      maxlength: [2000, "Background cannot exceed 2,000 characters"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for unauthenticated users
      index: true,
    },
    category: {
      type: String,
      required: false, // Made optional
      trim: true,
      enum: {
        values: [
          "professional",
          "creative",
          "educational",
          "entertainment",
          "wellness",
          "technology",
          "business",
          "lifestyle",
          "other",
        ],
        message: "Category must be one of the predefined values",
      },
    },
    initialPrompt: {
      type: String,
      required: false, // Made optional
      trim: true,
      maxlength: [1000, "Initial prompt cannot exceed 1,000 characters"],
    },
    profile: {
      name: {
        type: String,
        required: false, // Made optional
        trim: true,
        maxlength: [100, "Name cannot exceed 100 characters"],
      },
      designation: {
        type: String,
        required: false, // Made optional
        trim: true,
        maxlength: [150, "Designation cannot exceed 150 characters"],
      },
      age: {
        type: Number,
        required: false, // Made optional
        min: [18, "Age must be at least 18"],
        max: [100, "Age cannot exceed 100"],
      },
      uniquePerspective: {
        type: String,
        required: false, // Made optional
        trim: true,
        maxlength: [500, "Unique perspective cannot exceed 500 characters"],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
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
      required: false, // Made optional for soft auth
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
    prompts: [promptSchema], // Array of AI character prompts
    status: {
      type: String,
      enum: {
        values: ["active", "archived", "deleted"],
        message: "Status must be 'active', 'archived', or 'deleted'",
      },
      default: "active",
    },
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
chatSchema.index({ "prompts.category": 1 });
chatSchema.index({ "prompts.userId": 1 });
chatSchema.index({ "messages.id": 1 });
chatSchema.index({ "messages.deleted": 1 });
chatSchema.index({ "messages.updatedAt": -1 });

// // Virtual for message count
// chatSchema.virtual("messageCount").get(function () {
//   return this.messages.length;
// });

// Virtual for prompt count
// chatSchema.virtual("promptCount").get(function () {
//   return this.prompts.length;
// });

// // Virtual for latest message
// chatSchema.virtual("latestMessage").get(function () {
//   if (this.messages.length === 0) return null;
//   return this.messages[this.messages.length - 1];
// });

// Virtual for active prompts
chatSchema.virtual("activePrompts").get(function () {
  return this.prompts.filter((prompt) => prompt.isActive);
});

// Virtual for active message threads count
chatSchema.virtual("activeThreadsCount").get(function () {
  return this.messages.filter((thread) => !thread.deleted).length;
});

// Virtual for total messages count across all active threads
chatSchema.virtual("totalMessagesCount").get(function () {
  return this.messages
    .filter((thread) => !thread.deleted)
    .reduce((total, thread) => total + thread.messages.length, 0);
});

// Virtual for latest message across all threads
chatSchema.virtual("latestMessage").get(function () {
  const activeThreads = this.messages.filter((thread) => !thread.deleted);
  if (activeThreads.length === 0) return null;

  let latestMessage = null;
  let latestTimestamp = null;

  activeThreads.forEach((thread) => {
    thread.messages.forEach((message) => {
      if (!latestTimestamp || message.timestamp > latestTimestamp) {
        latestMessage = message;
        latestTimestamp = message.timestamp;
      }
    });
  });

  return latestMessage;
});

// Pre-save middleware to auto-generate title from first user message
chatSchema.pre("save", function (next) {
  if (this.isModified("messages")) {
    // Update updatedAt for modified message threads
    this.messages.forEach((thread) => {
      if (thread.isModified && !thread.deleted) {
        thread.updatedAt = new Date();
      }
    });

    // Auto-generate title from first user message if not set
    if (!this.title || this.title.includes("Chat ")) {
      // Find first user message across all active threads
      let firstUserMessage = null;

      for (const thread of this.messages) {
        if (!thread.deleted) {
          firstUserMessage = thread.messages.find((msg) => msg.role === "user");
          if (firstUserMessage) break;
        }
      }

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

// Instance method to add a message to a specific thread or create a new thread
chatSchema.methods.addMessage = function (
  threadId,
  role,
  content,
  metadata = {}
) {
  // Find existing thread
  let messageThread = this.messages.find(
    (thread) => thread.id === threadId && !thread.deleted
  );

  const newMessage = {
    role,
    content,
    metadata,
    timestamp: new Date(),
  };

  if (messageThread) {
    // Add to existing thread
    messageThread.messages.push(newMessage);
    messageThread.updatedAt = new Date();
    return messageThread.messages[messageThread.messages.length - 1];
  } else {
    // Create new thread
    const newThread = {
      id: threadId,
      messages: [newMessage],
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.messages.push(newThread);
    return this.messages[this.messages.length - 1].messages[0];
  }
};

// Instance method to add multiple messages to a thread
chatSchema.methods.addMessagesToThread = function (threadId, messages) {
  let messageThread = this.messages.find(
    (thread) => thread.id === threadId && !thread.deleted
  );

  const formattedMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
    metadata: msg.metadata || {},
    timestamp: new Date(),
  }));

  if (messageThread) {
    messageThread.messages.push(...formattedMessages);
    messageThread.updatedAt = new Date();
    return messageThread.messages.slice(-formattedMessages.length);
  } else {
    const newThread = {
      id: threadId,
      messages: formattedMessages,
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.messages.push(newThread);
    return this.messages[this.messages.length - 1].messages;
  }
};

// Instance method to soft delete a message thread
chatSchema.methods.deleteMessageThread = function (threadId) {
  const messageThread = this.messages.find((thread) => thread.id === threadId);
  if (messageThread) {
    messageThread.deleted = true;
    messageThread.updatedAt = new Date();
    return messageThread;
  }
  return null;
};

// Instance method to add a prompt
chatSchema.methods.addPrompt = function (promptData) {
  this.prompts.push(promptData);
  return this.prompts[this.prompts.length - 1];
};

// Instance method to get active prompts by category
chatSchema.methods.getPromptsByCategory = function (category) {
  return this.prompts.filter(
    (prompt) =>
      prompt.isActive && (category ? prompt.category === category : true)
  );
};

// Instance method to deactivate a prompt
chatSchema.methods.deactivatePrompt = function (promptId) {
  const prompt = this.prompts.id(promptId);
  if (prompt) {
    prompt.isActive = false;
    return prompt;
  }
  return null;
};

// Instance method to get conversation history in ChatGPT format (only latest/active threads)
chatSchema.methods.getConversationHistory = function (
  includeSystem = true,
  latestOnly = true
) {
  const activeThreads = this.messages.filter((thread) => !thread.deleted);

  if (latestOnly && activeThreads.length > 0) {
    // Get the most recently updated thread
    const latestThread = activeThreads.reduce((latest, current) =>
      current.updatedAt > latest.updatedAt ? current : latest
    );

    return latestThread.messages
      .filter((msg) => includeSystem || msg.role !== "system")
      .map((msg) => ({
        role: msg.role,
        timestamp: msg.timestamp,
      }));
  } else {
    // Return all messages from all active threads
    const allMessages = [];
    activeThreads.forEach((thread) => {
      thread.messages
        .filter((msg) => includeSystem || msg.role !== "system")
        .forEach((msg) => {
          allMessages.push({
            threadId: thread.id,
            role: msg.role,
            timestamp: msg.timestamp,
          });
        });
    });

    // Sort by timestamp
    return allMessages.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  }
};

// Instance method to get latest message thread
chatSchema.methods.getLatestMessageThread = function () {
  const activeThreads = this.messages.filter((thread) => !thread.deleted);

  if (activeThreads.length === 0) return null;

  return activeThreads.reduce((latest, current) =>
    current.updatedAt > latest.updatedAt ? current : latest
  );
};

// Instance method to get all active message threads
chatSchema.methods.getActiveMessageThreads = function () {
  return this.messages.filter((thread) => !thread.deleted);
};

// Instance method to get specific message thread by ID
chatSchema.methods.getMessageThread = function (threadId) {
  return this.messages.find(
    (thread) => thread.id === threadId && !thread.deleted
  );
};

// Static method to get user's active chats (authenticated users) - returns latest messages only
chatSchema.statics.getUserActiveChats = function (userId, limit = 10) {
  return this.getChatsWithLatestMessages({
    userId,
    limit,
    status: "active",
  });
};

// Static method to get chats by user with latest message threads only
chatSchema.statics.getChatsWithLatestMessages = function ({
  userId,
  limit = 10,
  status = "active",
}) {
  const query = { status };

  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  } else {
    throw new Error("userId must be provided");
  }

  return this.aggregate([
    { $match: query },
    {
      $addFields: {
        // Filter out deleted message threads
        activeMessages: {
          $filter: {
            input: "$messages",
            as: "thread",
            cond: { $eq: ["$$thread.deleted", false] },
          },
        },
      },
    },
    {
      $addFields: {
        // Get the latest message thread
        latestMessageThread: {
          $reduce: {
            input: "$activeMessages",
            initialValue: null,
            in: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ["$$value", null] },
                    { $gt: ["$$this.updatedAt", "$$value.updatedAt"] },
                  ],
                },
                then: "$$this",
                else: "$$value",
              },
            },
          },
        },
      },
    },
    {
      $project: {
        title: 1,
        userId: 1,
        status: 1,
        prompts: 1,
        createdAt: 1,
        updatedAt: 1,
        messages: "$latestMessageThread.messages",
        latestThreadId: "$latestMessageThread.id",
        latestThreadUpdatedAt: "$latestMessageThread.updatedAt",
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
        pipeline: [{ $project: { fullName: 1, email: 1 } }],
      },
    },
    {
      $addFields: {
        userId: { $arrayElemAt: ["$userInfo", 0] },
      },
    },
    { $unset: "userInfo" },
  ]);
};

// Static method to get chats by user (returns all data)
chatSchema.statics.getChats = function ({
  userId,
  limit = 10,
  status = "active",
}) {
  const query = { status };

  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  } else {
    throw new Error("userId must be provided");
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "fullName email");
};

// Static method to find chats by prompt category
chatSchema.statics.getChatsByPromptCategory = function (
  category,
  { userId, limit = 10 }
) {
  const query = {
    status: "active",
    "prompts.category": category,
    "prompts.isActive": true,
  };

  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }

  return this.find(query).sort({ createdAt: -1 }).limit(limit);
};

// Static method to archive old chats (simplified without statistics)
chatSchema.statics.archiveOldChats = async function (daysSinceCreation = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysSinceCreation);

  const result = await this.updateMany(
    {
      status: "active",
      createdAt: { $lt: cutoffDate },
    },
    {
      status: "archived",
    }
  );

  return result.modifiedCount;
};

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
