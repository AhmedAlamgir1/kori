const JWTService = require("../utils/jwt");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      const response = ApiResponse.unauthorized("Access token is required");
      return res.status(response.statusCode).json(response);
    }

    try {
      const decoded = JWTService.verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        const response = ApiResponse.unauthorized("User not found");
        return res.status(response.statusCode).json(response);
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        const response = ApiResponse.unauthorized("Access token has expired");
        return res.status(response.statusCode).json(response);
      } else if (jwtError.name === "JsonWebTokenError") {
        const response = ApiResponse.unauthorized("Invalid access token");
        return res.status(response.statusCode).json(response);
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    console.error("Authentication error:", error);
    const response = ApiResponse.internalError("Authentication failed");
    return res.status(response.statusCode).json(response);
  }
};

// Authorization middleware - check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      const response = ApiResponse.unauthorized("Authentication required");
      return res.status(response.statusCode).json(response);
    }

    if (!roles.includes(req.user.role)) {
      const response = ApiResponse.forbidden("Insufficient permissions");
      return res.status(response.statusCode).json(response);
    }

    next();
  };
};

// Optional authentication middleware - doesn't throw error if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const decoded = JWTService.verifyAccessToken(token);
        const user = await User.findById(decoded.userId).select("-password");
        req.user = user;
      } catch (jwtError) {
        // Silently ignore token errors for optional auth
        req.user = null;
      }
    }

    next();
  } catch (error) {
    console.error("Optional authentication error:", error);
    req.user = null;
    next();
  }
};

// Middleware to check if user is verified
const requireVerified = (req, res, next) => {
  if (!req.user) {
    const response = ApiResponse.unauthorized("Authentication required");
    return res.status(response.statusCode).json(response);
  }

  if (!req.user.isVerified) {
    const response = ApiResponse.forbidden("Email verification required");
    return res.status(response.statusCode).json(response);
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  requireVerified,
};
