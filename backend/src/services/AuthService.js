const User = require("../models/User");
const JWTService = require("../utils/jwt");
const ApiError = require("../utils/ApiError");
const crypto = require("crypto");

class AuthService {
  // Register new user
  static async register(userData) {
    const { fullName, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict("User with this email already exists");
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password,
    });

    await user.save();

    // Generate tokens
    const tokenPayload = { userId: user._id, email: user.email };
    const { accessToken, refreshToken } =
      JWTService.generateTokenPair(tokenPayload);

    // Save refresh token
    await user.addRefreshToken(refreshToken);

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;

    return {
      user: userResponse,
      accessToken,
      refreshToken,
    };
  }

  // Login user
  static async login(email, password) {
    // Use the static authenticate method from User model
    const authResult = await User.authenticate(email, password);

    if (!authResult.success) {
      const reasons = User.getAuthFailureReasons();

      switch (authResult.reason) {
        case reasons.NOT_FOUND:
          throw ApiError.unauthorized("Invalid email or password");
        case reasons.PASSWORD_INCORRECT:
          throw ApiError.unauthorized("Invalid email or password");
        case reasons.MAX_ATTEMPTS:
          throw ApiError.unauthorized(
            "Account temporarily locked due to too many failed login attempts. Please try again later."
          );
        default:
          throw ApiError.unauthorized("Authentication failed");
      }
    }

    const user = authResult.user;

    // Generate tokens
    const tokenPayload = { userId: user._id, email: user.email };
    const { accessToken, refreshToken } =
      JWTService.generateTokenPair(tokenPayload);

    // Save refresh token
    await user.addRefreshToken(refreshToken);

    // Return user without sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;

    return {
      user: userResponse,
      accessToken,
      refreshToken,
    };
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = JWTService.verifyRefreshToken(refreshToken);

      // Find user and check if refresh token exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw ApiError.unauthorized("User not found");
      }

      // Check if refresh token exists in user's tokens
      const tokenExists = user.refreshTokens.some(
        (tokenObj) => tokenObj.token === refreshToken
      );
      if (!tokenExists) {
        throw ApiError.unauthorized("Invalid refresh token");
      }

      // Generate new access token
      const tokenPayload = { userId: user._id, email: user.email };
      const newAccessToken = JWTService.generateAccessToken(tokenPayload);

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw ApiError.unauthorized("Refresh token has expired");
      } else if (error.name === "JsonWebTokenError") {
        throw ApiError.unauthorized("Invalid refresh token");
      }
      throw error;
    }
  }

  // Logout user (single device)
  static async logout(userId, refreshToken) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Remove the specific refresh token
    await user.removeRefreshToken(refreshToken);

    return { message: "Logged out successfully" };
  }

  // Logout from all devices
  static async logoutAll(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Remove all refresh tokens
    await user.removeAllRefreshTokens();

    return { message: "Logged out from all devices successfully" };
  }

  // Get user profile
  static async getProfile(userId) {
    const user = await User.findById(userId).select(
      "-password -refreshTokens -loginAttempts -lockUntil"
    );
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return user;
  }

  // Update user profile
  static async updateProfile(userId, updateData) {
    const { fullName, email } = updateData;

    // Check if email is being updated and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        throw ApiError.conflict("Email is already in use");
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { fullName, email },
      { new: true, runValidators: true }
    ).select("-password -refreshTokens -loginAttempts -lockUntil");

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return user;
  }

  // Change password
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw ApiError.unauthorized("Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log out from all devices for security
    await user.removeAllRefreshTokens();

    return { message: "Password changed successfully. Please log in again." };
  }

  // Generate password reset token (placeholder for future email integration)
  static async generatePasswordResetToken(email) {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal that user doesn't exist
      return {
        message:
          "If an account with that email exists, a password reset link has been sent.",
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // In a real application, you would send this via email
    // For now, we'll just return it (don't do this in production!)
    return {
      message: "Password reset token generated",
      resetToken, // Remove this in production
    };
  }

  // Reset password using token
  static async resetPassword(token, newPassword) {
    // Hash the token to compare with stored version
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw ApiError.badRequest(
        "Password reset token is invalid or has expired"
      );
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Log out from all devices
    await user.removeAllRefreshTokens();

    return {
      message:
        "Password reset successful. Please log in with your new password.",
    };
  }

  // Verify user account (placeholder for email verification)
  static async verifyAccount(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    user.isVerified = true;
    await user.save();

    return { message: "Account verified successfully" };
  }
}

module.exports = AuthService;
