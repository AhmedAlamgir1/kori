/**
 * Message roles constants
 * Keep this list synchronized across model, service, and validator files
 */

const MESSAGE_ROLES = [
  "user", // User messages
  "assistant", // AI assistant responses
  "system", // System messages
  "bot", // Bot responses (alternative to assistant)
  "moderator", // Moderation messages
  "notification", // System notifications
  "tool", // Tool/function call responses
  "function", // Function execution results
  "error", // Error messages
];

const MESSAGE_ROLES_DESCRIPTION = {
  user: "User messages",
  assistant: "AI assistant responses",
  system: "System messages",
  bot: "Bot responses",
  moderator: "Moderation messages",
  notification: "System notifications",
  tool: "Tool/function call responses",
  function: "Function execution results",
  error: "Error messages",
};

module.exports = {
  MESSAGE_ROLES,
  MESSAGE_ROLES_DESCRIPTION,
};
