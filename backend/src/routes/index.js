const express = require("express");
const authRoutes = require("./auth");
const chatRoutes = require("./chat");
const imageRoutes = require("./image");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ApiResponse = require("../utils/ApiResponse");
const { authenticate, optionalAuth } = require("../middleware/auth");
const config = require("../config/config");

const router = express.Router();

// Initialize Gemini AI (keeping your existing functionality)
let genAI;
if (config.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
}

// Test endpoint
router.get("/test", (req, res) => {
  const response = ApiResponse.success("Backend server running", {
    status: "Backend server running",
    apiKeyPresent: !!config.GEMINI_API_KEY,
    apiKeyLength: config.GEMINI_API_KEY ? config.GEMINI_API_KEY.length : 0,
  });
  res.status(response.statusCode).json(response);
});

// Authentication routes
router.use("/auth", authRoutes);

// Chat routes
router.use("/chat", chatRoutes);

// Image routes
router.use("/images", imageRoutes);

// Gemini AI endpoint (keeping your existing functionality, but with optional auth)
router.post("/gemini", optionalAuth, async (req, res, next) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      const response = ApiResponse.error("Prompt is required", 400);
      return res.status(response.statusCode).json(response);
    }

    if (!genAI) {
      const response = ApiResponse.error("Gemini API is not configured", 500);
      return res.status(response.statusCode).json(response);
    }

    console.log("Attempting Gemini API call with prompt:", prompt);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const response = ApiResponse.success("Content generated successfully", {
      response: text,
      user: req.user ? req.user.fullName : "Anonymous",
    });

    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Gemini API error:", error);
    next(error);
  }
});

// Protected route example
router.get("/protected", authenticate, (req, res) => {
  const response = ApiResponse.success("Access granted to protected resource", {
    user: req.user.fullName,
    message: "This is a protected route that requires authentication",
  });
  res.status(response.statusCode).json(response);
});

module.exports = router;
