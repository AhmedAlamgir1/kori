const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("../config/config");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters long"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
          expires: "7d",
        },
      },
    ],
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    generatedImages: [
      {
        imageUrl: {
          type: String,
          required: true,
        },
        s3Key: {
          type: String,
          required: false, // Making this optional since we may store images only in Replicate
        },
        prompt: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual for account lock
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(config.BCRYPT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to handle failed login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1,
      },
      $set: {
        loginAttempts: 1,
      },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // If we have max attempts and no lock, lock the account
  if (this.loginAttempts + 1 >= config.MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + config.LOCK_TIME,
    };
  }

  return this.updateOne(updates);
};

// Static method to get reasons for auth failures
userSchema.statics.getAuthFailureReasons = function () {
  return {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2,
  };
};

// Static method for authentication
userSchema.statics.authenticate = async function (email, password) {
  const reasons = this.getAuthFailureReasons();

  try {
    const user = await this.findOne({ email }).select("+password");

    if (!user) {
      return { success: false, reason: reasons.NOT_FOUND };
    }

    // Check if account is locked
    if (user.isLocked) {
      await user.incLoginAttempts();
      return { success: false, reason: reasons.MAX_ATTEMPTS };
    }

    const isMatch = await user.comparePassword(password);

    if (isMatch) {
      // Reset attempts if login is successful
      if (user.loginAttempts > 0) {
        await user.updateOne({
          $unset: { loginAttempts: 1, lockUntil: 1 },
        });
      }
      return { success: true, user };
    }

    // Password is incorrect, increment login attempts
    await user.incLoginAttempts();
    return { success: false, reason: reasons.PASSWORD_INCORRECT };
  } catch (error) {
    throw error;
  }
};

// Method to add refresh token
userSchema.methods.addRefreshToken = async function (refreshToken) {
  this.refreshTokens.push({ token: refreshToken });

  // Keep only the last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }

  await this.save();
};

// Method to remove refresh token
userSchema.methods.removeRefreshToken = async function (refreshToken) {
  this.refreshTokens = this.refreshTokens.filter(
    (tokenObj) => tokenObj.token !== refreshToken
  );
  await this.save();
};

// Method to remove all refresh tokens (logout all devices)
userSchema.methods.removeAllRefreshTokens = async function () {
  this.refreshTokens = [];
  await this.save();
};

module.exports = mongoose.model("User", userSchema);
