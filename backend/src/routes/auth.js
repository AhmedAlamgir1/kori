const express = require("express");
const AuthController = require("../controllers/AuthController");
const { authenticate, optionalAuth } = require("../middleware/auth");
const { authRateLimiter } = require("../middleware/security");
const {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  updateProfileValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation,
  googleAuthValidation,
  handleValidationErrors,
} = require("../validators/authValidators");

const router = express.Router();

// Public routes (no authentication required)
router.post(
  "/register",
  authRateLimiter,
  registerValidation,
  handleValidationErrors,
  AuthController.register
);

router.post(
  "/login",
  authRateLimiter,
  loginValidation,
  handleValidationErrors,
  AuthController.login
);

router.post(
  "/refresh-token",
  refreshTokenValidation,
  handleValidationErrors,
  AuthController.refreshToken
);

router.post(
  "/forgot-password",
  authRateLimiter,
  forgotPasswordValidation,
  handleValidationErrors,
  AuthController.forgotPassword
);

router.post(
  "/reset-password",
  authRateLimiter,
  resetPasswordValidation,
  handleValidationErrors,
  AuthController.resetPassword
);

// Google OAuth routes
router.get("/google", authRateLimiter, AuthController.googleAuthRedirect);

router.get("/google/callback", AuthController.googleAuthCallback);

router.post(
  "/google/token",
  authRateLimiter,
  googleAuthValidation,
  handleValidationErrors,
  AuthController.googleAuth
);

// Protected routes (authentication required)
router.use(authenticate); // All routes below require authentication

router.post("/logout", AuthController.logout);
router.post("/logout-all", AuthController.logoutAll);
router.get("/profile", AuthController.getProfile);
router.get("/me", AuthController.me);

router.put(
  "/profile",
  updateProfileValidation,
  handleValidationErrors,
  AuthController.updateProfile
);

router.put(
  "/change-password",
  changePasswordValidation,
  handleValidationErrors,
  AuthController.changePassword
);

router.put("/verify", AuthController.verifyAccount);

module.exports = router;
