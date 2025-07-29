const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("../config/config");
const ApiResponse = require("../utils/ApiResponse");

// Rate limiting middleware
const createRateLimiter = (
  windowMs = config.RATE_LIMIT_WINDOW,
  max = config.RATE_LIMIT_MAX_REQUESTS,
  message = "Too many requests from this IP"
) => {
  return rateLimit({
    windowMs,
    max,
    message: (req, res) => {
      const response = ApiResponse.tooManyRequests(message);
      return response;
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Stricter rate limiting for authentication routes
const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  "Too many authentication attempts from this IP, please try again later"
);

// General API rate limiter
const apiRateLimiter = createRateLimiter();

// Chat-specific rate limiting for message sending
const chatRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  10, // 10 messages per minute
  "Too many chat messages from this IP, please slow down"
);

// Security middleware
const securityMiddleware = helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

// Request logging middleware
const requestLogger = morgan(
  config.NODE_ENV === "production" ? "combined" : "dev"
);

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    const response = ApiResponse.validationError(errors);
    return res.status(response.statusCode).json(response);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const response = ApiResponse.conflict(`${field} already exists`);
    return res.status(response.statusCode).json(response);
  }

  // Mongoose cast error
  if (err.name === "CastError") {
    const response = ApiResponse.error("Invalid resource ID");
    return res.status(400).json(response);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const response = ApiResponse.unauthorized("Invalid token");
    return res.status(response.statusCode).json(response);
  }

  if (err.name === "TokenExpiredError") {
    const response = ApiResponse.unauthorized("Token expired");
    return res.status(response.statusCode).json(response);
  }

  // Custom API errors
  if (err.statusCode) {
    const response = new ApiResponse(err.statusCode, err.message, err.errors);
    return res.status(response.statusCode).json(response);
  }

  // Default server error
  const response = ApiResponse.internalError(
    config.NODE_ENV === "production" ? "Something went wrong" : err.message
  );
  res.status(response.statusCode).json(response);
};

// 404 handler middleware
const notFoundHandler = (req, res) => {
  const response = ApiResponse.notFound(`Route ${req.originalUrl} not found`);
  res.status(response.statusCode).json(response);
};

module.exports = {
  authRateLimiter,
  apiRateLimiter,
  chatRateLimiter,
  securityMiddleware,
  requestLogger,
  errorHandler,
  notFoundHandler,
  createRateLimiter,
};
