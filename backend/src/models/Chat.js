const mongoose = require("mongoose");
const { MESSAGE_ROLES } = require("../constants/messageRoles");

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
    profile: {
      name: {
        type: String,
        required: false, // Made optional
        trim: true,
        maxlength: [100, "Name cannot exceed 100 characters"],
      },
      occupation: {
        type: String,
        required: false, // Made optional
        trim: true,
        maxlength: [150, "Occupation cannot exceed 150 characters"],
      },
      age: {
        type: Number,
        required: false, // Made optional
        min: [18, "Age must be at least 18"],
        max: [100, "Age cannot exceed 100"],
      },
    },
    uniquePerspective: {
      type: String,
      required: false, // Made optional
      trim: true,
      maxlength: [500, "Unique perspective cannot exceed 500 characters"],
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

// Question schema for storing predefined questions
const questionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Question category cannot exceed 100 characters"],
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, "Question cannot exceed 500 characters"],
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
    prompts: [promptSchema], // Array of AI character prompts
    questions: [questionSchema], // Array of predefined questions
    initialPrompt: {
      type: String,
      required: false, // Made optional
      trim: true,
      maxlength: [1000, "Initial prompt cannot exceed 1,000 characters"],
    },
    category: {
      type: String,
      required: false, // Made optional
      trim: true,
      enum: {
        values: ["evaluative", "explorative"],
        message: "Category must be one of the predefined values",
      },
    },
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
chatSchema.index({ initialPrompt: "text" }); // Text index for searching initial prompts
chatSchema.index({ category: 1 });
chatSchema.index({ "prompts.userId": 1 });

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

// Virtual for active message threads count (requires async population)
chatSchema.virtual("activeThreadsCount", {
  ref: "Message",
  localField: "_id",
  foreignField: "chatId",
  count: true,
  match: { deleted: false },
});

// Virtual for total messages count across all active threads (requires async population)
chatSchema.virtual("totalMessagesCount", {
  ref: "Message",
  localField: "_id",
  foreignField: "chatId",
  match: { deleted: false },
});

// Instance method to add a message to a specific prompt
chatSchema.methods.addMessage = async function (promptId, role, content) {
  const Message = require("./Message");

  // Find existing message thread
  let messageThread = await Message.findOne({
    chatId: this._id,
    promptId,
    deleted: false,
  });

  if (messageThread) {
    // Add to existing thread
    messageThread.addMessage(role, content);
    await messageThread.save();
    return messageThread.messages[messageThread.messages.length - 1];
  } else {
    // Create new message thread
    const newMessageThread = new Message({
      chatId: this._id,
      promptId,
      userId: this.userId,
      messages: [
        {
          role,
          content,
          timestamp: new Date(),
        },
      ],
    });

    await newMessageThread.save();
    return newMessageThread.messages[0];
  }
};

// Instance method to add multiple messages to a thread
chatSchema.methods.addMessagesToThread = async function (promptId, messages) {
  const Message = require("./Message");

  let messageThread = await Message.findOne({
    chatId: this._id,
    promptId,
    deleted: false,
  });

  const formattedMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
    timestamp: new Date(),
  }));

  if (messageThread) {
    messageThread.addMessages(messages);
    await messageThread.save();
    return messageThread.messages.slice(-formattedMessages.length);
  } else {
    const newMessageThread = new Message({
      chatId: this._id,
      promptId,
      threadId,
      userId: this.userId,
      messages: formattedMessages,
    });

    await newMessageThread.save();
    return newMessageThread.messages;
  }
};

// Instance method to soft delete a message thread
chatSchema.methods.deleteMessageThread = async function (promptId, threadId) {
  const Message = require("./Message");

  const messageThread = await Message.findOne({
    chatId: this._id,
    promptId,
    threadId,
  });

  if (messageThread) {
    await messageThread.softDelete();
    return messageThread;
  }
  return null;
};

// Instance method to add a prompt
chatSchema.methods.addPrompt = function (promptData) {
  this.prompts.push(promptData);
  return this.prompts[this.prompts.length - 1];
};

// Instance method to add a question
chatSchema.methods.addQuestion = function (questionData) {
  this.questions.push(questionData);
  return this.questions[this.questions.length - 1];
};

// Instance method to remove a question by ID
chatSchema.methods.removeQuestion = function (questionId) {
  const questionIndex = this.questions.findIndex(
    (q) => q._id.toString() === questionId.toString()
  );
  if (questionIndex > -1) {
    const removedQuestion = this.questions[questionIndex];
    this.questions.splice(questionIndex, 1);
    return removedQuestion;
  }
  return null;
};

// Instance method to update a question by ID
chatSchema.methods.updateQuestion = function (questionId, updateData) {
  const question = this.questions.id(questionId);
  if (question) {
    Object.keys(updateData).forEach((key) => {
      if (key !== "_id") {
        question[key] = updateData[key];
      }
    });
    return question;
  }
  return null;
};

// Instance method to get questions by category
chatSchema.methods.getQuestionsByCategory = function (category) {
  return this.questions.filter((question) => question.category === category);
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

// Instance method to get conversation history for a specific prompt
chatSchema.methods.getConversationHistory = async function (
  promptId,
  includeSystem = true,
  latestOnly = true
) {
  const Message = require("./Message");

  return await Message.getConversationHistory(this._id, promptId, {
    includeSystem,
    latestOnly,
  });
};

// Instance method to get latest message thread for a prompt
chatSchema.methods.getLatestMessageThread = async function (promptId) {
  const Message = require("./Message");

  const messageThread = await Message.findOne({
    chatId: this._id,
    promptId,
    deleted: false,
  }).sort({ updatedAt: -1 });

  return messageThread;
};

// Instance method to get all active message threads for a prompt
chatSchema.methods.getActiveMessageThreads = async function (promptId) {
  const Message = require("./Message");

  return await Message.find({
    chatId: this._id,
    promptId,
    deleted: false,
  }).sort({ updatedAt: -1 });
};

// Instance method to get specific message thread by ID
chatSchema.methods.getMessageThread = async function (promptId, threadId) {
  const Message = require("./Message");

  return await Message.findOne({
    chatId: this._id,
    promptId,
    threadId,
    deleted: false,
  });
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
chatSchema.statics.getChatsWithLatestMessages = async function ({
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

  // Get chats first
  const chats = await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "fullName email")
    .lean();

  // Get latest messages for each chat
  const Message = require("./Message");

  for (const chat of chats) {
    const latestMessageThread = await Message.findOne({
      chatId: chat._id,
      deleted: false,
    })
      .sort({ updatedAt: -1 })
      .lean();

    if (latestMessageThread) {
      chat.latestMessages = latestMessageThread.messages;
      chat.latestThreadId = latestMessageThread.threadId;
      chat.latestThreadUpdatedAt = latestMessageThread.updatedAt;
      chat.promptId = latestMessageThread.promptId;
    }
  }

  return chats;
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

// Static method to find chats by category
chatSchema.statics.getChatsByCategory = function (
  category,
  { userId, limit = 10 }
) {
  const query = {
    status: "active",
    category: category,
  };

  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }

  return this.find(query).sort({ createdAt: -1 }).limit(limit);
};

// Static method to search chats by initial prompt
chatSchema.statics.searchByInitialPrompt = function (
  searchText,
  { userId, limit = 10 }
) {
  const query = {
    status: "active",
    initialPrompt: { $regex: searchText, $options: "i" },
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
