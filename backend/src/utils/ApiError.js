class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = "Bad request", errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized access") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Access forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Resource already exists") {
    return new ApiError(409, message);
  }

  static tooManyRequests(message = "Too many requests") {
    return new ApiError(429, message);
  }

  static internalError(message = "Internal server error") {
    return new ApiError(500, message);
  }

  static validationError(errors, message = "Validation failed") {
    return new ApiError(400, message, errors);
  }
}

module.exports = ApiError;
