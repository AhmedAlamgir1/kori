class ApiResponse {
  constructor(statusCode, message, data = null, success = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = success ?? statusCode < 400;
    this.timestamp = new Date().toISOString();
  }

  static success(message, data = null, statusCode = 200) {
    return new ApiResponse(statusCode, message, data, true);
  }

  static error(message, statusCode = 500, data = null) {
    return new ApiResponse(statusCode, message, data, false);
  }

  static validationError(errors, message = "Validation failed") {
    return new ApiResponse(400, message, { errors }, false);
  }

  static unauthorized(message = "Unauthorized access") {
    return new ApiResponse(401, message, null, false);
  }

  static forbidden(message = "Access forbidden") {
    return new ApiResponse(403, message, null, false);
  }

  static notFound(message = "Resource not found") {
    return new ApiResponse(404, message, null, false);
  }

  static conflict(message = "Resource already exists") {
    return new ApiResponse(409, message, null, false);
  }

  static tooManyRequests(message = "Too many requests") {
    return new ApiResponse(429, message, null, false);
  }

  static internalError(message = "Internal server error") {
    return new ApiResponse(500, message, null, false);
  }
}

module.exports = ApiResponse;
