const AuthService = require("../services/AuthService");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

class AuthController {
  // Register new user
  static async register(req, res, next) {
    try {
      const { fullName, email, password } = req.body;

      const result = await AuthService.register({
        fullName,
        email,
        password,
      });

      // Set refresh token as HTTP-only cookie
      const cookieOptions = {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res.cookie("refreshToken", result.refreshToken, cookieOptions);

      const response = ApiResponse.success(
        "User registered successfully",
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        201
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Login user
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      // Set refresh token as HTTP-only cookie
      const cookieOptions = {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res.cookie("refreshToken", result.refreshToken, cookieOptions);

      const response = ApiResponse.success("Login successful", {
        user: result.user,
        accessToken: result.accessToken,
      });

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Refresh access token
  static async refreshToken(req, res, next) {
    try {
      // Get refresh token from cookie or request body
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        throw ApiError.unauthorized("Refresh token is required");
      }

      const result = await AuthService.refreshAccessToken(refreshToken);

      const response = ApiResponse.success("Token refreshed successfully", {
        accessToken: result.accessToken,
      });

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Logout user (single device)
  static async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (refreshToken) {
        await AuthService.logout(req.user._id, refreshToken);
      }

      // Clear refresh token cookie
      res.clearCookie("refreshToken");

      const response = ApiResponse.success("Logged out successfully");
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Logout from all devices
  static async logoutAll(req, res, next) {
    try {
      await AuthService.logoutAll(req.user._id);

      // Clear refresh token cookie
      res.clearCookie("refreshToken");

      const response = ApiResponse.success(
        "Logged out from all devices successfully"
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  static async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user._id);

      const response = ApiResponse.success("Profile retrieved successfully", {
        user,
      });
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  static async updateProfile(req, res, next) {
    try {
      const { fullName, email } = req.body;

      const user = await AuthService.updateProfile(req.user._id, {
        fullName,
        email,
      });

      const response = ApiResponse.success("Profile updated successfully", {
        user,
      });
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Change password
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      const result = await AuthService.changePassword(
        req.user._id,
        currentPassword,
        newPassword
      );

      // Clear refresh token cookie since user will need to log in again
      res.clearCookie("refreshToken");

      const response = ApiResponse.success(result.message);
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Forgot password
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const result = await AuthService.generatePasswordResetToken(email);

      const response = ApiResponse.success(
        result.message,
        result.resetToken ? { resetToken: result.resetToken } : null
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Reset password
  static async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      const result = await AuthService.resetPassword(token, password);

      const response = ApiResponse.success(result.message);
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Verify account
  static async verifyAccount(req, res, next) {
    try {
      const result = await AuthService.verifyAccount(req.user._id);

      const response = ApiResponse.success(result.message);
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get current user info (for checking authentication status)
  static async me(req, res, next) {
    try {
      const response = ApiResponse.success("User authenticated", {
        user: req.user,
      });
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Google OAuth sign-in/sign-up
  static async googleAuth(req, res, next) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        throw ApiError.badRequest("Google ID token is required");
      }

      const result = await AuthService.googleAuth(idToken);

      // Set refresh token as HTTP-only cookie
      const cookieOptions = {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res.cookie("refreshToken", result.refreshToken, cookieOptions);

      const response = ApiResponse.success("Google authentication successful", {
        user: result.user,
        accessToken: result.accessToken,
      });

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Google OAuth - Redirect to Google consent screen
  static async googleAuthRedirect(req, res, next) {
    try {
      const { state } = req.query; // Optional state parameter for maintaining client state

      const authUrl = AuthService.generateGoogleAuthUrl(state);

      // Redirect user to Google OAuth consent screen
      res.redirect(authUrl);
    } catch (error) {
      next(error);
    }
  }

  // Google OAuth - Handle callback from Google
  static async googleAuthCallback(req, res, next) {
    try {
      const { code, error, state } = req.query;

      // Handle OAuth errors
      if (error) {
        const errorMessage =
          error === "access_denied"
            ? "Access denied by user"
            : "OAuth authentication failed";

        // Redirect to frontend with error
        const frontendUrl = `${
          config.FRONTEND_URL
        }/auth/callback?error=${encodeURIComponent(errorMessage)}`;
        return res.redirect(frontendUrl);
      }

      // Handle missing authorization code
      if (!code) {
        const frontendUrl = `${
          config.FRONTEND_URL
        }/auth/callback?error=${encodeURIComponent(
          "Authorization code not provided"
        )}`;
        return res.redirect(frontendUrl);
      }

      // Process the OAuth callback
      const result = await AuthService.handleGoogleCallback(code);

      // Set refresh token as HTTP-only cookie
      const cookieOptions = {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      res.cookie("refreshToken", result.refreshToken, cookieOptions);

      // Redirect to frontend with success and access token
      const frontendUrl = `${
        config.FRONTEND_URL
      }/auth/callback?success=true&token=${result.accessToken}${
        state ? `&state=${state}` : ""
      }`;
      res.redirect(frontendUrl);
    } catch (error) {
      // Handle authentication errors
      const errorMessage = error.message || "Authentication failed";
      const frontendUrl = `${
        config.FRONTEND_URL
      }/auth/callback?error=${encodeURIComponent(errorMessage)}`;
      res.redirect(frontendUrl);
    }
  }

  // Delete user profile
  static async deleteProfile(req, res, next) {
    try {
      const userId = req.user._id;

      await AuthService.deleteProfile(userId);

      // Clear refresh token cookie
      res.clearCookie("refreshToken");

      const response = ApiResponse.success(
        "Profile deleted successfully",
        null,
        200
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
