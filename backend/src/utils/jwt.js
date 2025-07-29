const jwt = require("jsonwebtoken");
const config = require("../config/config");

class JWTService {
  // Generate access token
  static generateAccessToken(payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE,
    });
  }

  // Generate refresh token
  static generateRefreshToken(payload) {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRE,
    });
  }

  // Verify access token
  static verifyAccessToken(token) {
    return jwt.verify(token, config.JWT_SECRET);
  }

  // Verify refresh token
  static verifyRefreshToken(token) {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
  }

  // Generate token pair
  static generateTokenPair(payload) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  // Extract token from header
  static extractTokenFromHeader(authHeader) {
    if (!authHeader) return null;

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }

  // Decode token without verification (for expired tokens)
  static decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = JWTService;
