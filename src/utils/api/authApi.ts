import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Types for auth API
export interface User {
  _id: string;
  fullName: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

/**
 * Helper function for making authenticated requests
 */
async function makeAuthenticatedRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/api/auth${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: "include", // Include cookies for refresh tokens
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      message: "Network error",
      statusCode: response.status,
    }));

    //throw new Error(errorData.message || `HTTP ${response.status}`);
    console.log(errorData, "errorDaaata");
    return errorData;
  }

  return response.json();
}

/**
 * Helper function for making public requests (no auth required)
 */
async function makePublicRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/auth${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Include cookies for refresh tokens
    mode: "cors",
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      message: "Network error",
      statusCode: response.status,
    }));

    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Register a new user
 */
export async function register(
  userData: RegisterRequest
): Promise<AuthResponse> {
  try {
    const response = await makePublicRequest("/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    // Store tokens and user data
    if (response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    toast.success("Registration successful! Welcome to Kori.");
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    toast.error(error instanceof Error ? error.message : "Registration failed");
    throw error;
  }
}

/**
 * Login user
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  try {
    const response = await makePublicRequest("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Store tokens and user data
    if (response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    toast.success("Login successful! Welcome back.");
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    toast.error(error instanceof Error ? error.message : "Login failed");
    throw error;
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(
  refreshTokenData?: RefreshTokenRequest
): Promise<{ accessToken: string }> {
  try {
    const response = await makePublicRequest("/refresh-token", {
      method: "POST",
      body: JSON.stringify(refreshTokenData || {}),
    });

    // Update stored access token
    if (response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }

    return response.data;
  } catch (error) {
    console.error("Token refresh error:", error);
    // Clear stored tokens on refresh failure
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    throw error;
  }
}

/**
 * Logout user (current device)
 */
export async function logout(): Promise<void> {
  try {
    await makeAuthenticatedRequest("/logout", {
      method: "POST",
    });

    // Clear stored data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    toast.success("Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    // Clear stored data even if logout request fails
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    throw error;
  }
}

/**
 * Logout from all devices
 */
export async function logoutAll(): Promise<void> {
  try {
    await makeAuthenticatedRequest("/logout-all", {
      method: "POST",
    });

    // Clear stored data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    toast.success("Logged out from all devices successfully");
  } catch (error) {
    console.error("Logout all error:", error);
    // Clear stored data even if logout request fails
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    throw error;
  }
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<User> {
  try {
    const response = await makeAuthenticatedRequest("/profile");
    return response.data.user;
  } catch (error) {
    console.error("Get profile error:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to load profile"
    );
    throw error;
  }
}

/**
 * Get current user info (for checking auth status)
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await makeAuthenticatedRequest("/me");
    return response.data.user;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  profileData: UpdateProfileRequest
): Promise<User> {
  try {
    const response = await makeAuthenticatedRequest("/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });

    // Update stored user data
    if (response.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    toast.success("Profile updated successfully");
    return response.data.user;
  } catch (error) {
    console.error("Update profile error:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to update profile"
    );
    throw error;
  }
}

/**
 * Change password
 */
export async function changePassword(
  passwordData: ChangePasswordRequest
): Promise<any> {
  try {
    const res = await makeAuthenticatedRequest("/change-password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
    return res;
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
}

/**
 * Delete account
 */
export async function deleteAccount(userId: string): Promise<any> {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const res = await makeAuthenticatedRequest("/profile", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      method: "DELETE",
    });
    return res;
  } catch (error) {
    console.error("Delete account error:", error);
    throw error;
  }
}

/**
 * Request password reset
 */
export async function forgotPassword(
  emailData: ForgotPasswordRequest
): Promise<void> {
  try {
    await makePublicRequest("/forgot-password", {
      method: "POST",
      body: JSON.stringify(emailData),
    });

    toast.success("Password reset email sent. Please check your inbox.");
  } catch (error) {
    console.error("Forgot password error:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to send reset email"
    );
    throw error;
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  resetData: ResetPasswordRequest
): Promise<void> {
  try {
    await makePublicRequest("/reset-password", {
      method: "POST",
      body: JSON.stringify(resetData),
    });

    toast.success(
      "Password reset successfully. You can now log in with your new password."
    );
  } catch (error) {
    console.error("Reset password error:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to reset password"
    );
    throw error;
  }
}

/**
 * Verify account
 */
export async function verifyAccount(): Promise<void> {
  try {
    await makeAuthenticatedRequest("/verify", {
      method: "PUT",
    });

    toast.success("Account verified successfully");
  } catch (error) {
    console.error("Verify account error:", error);
    toast.error(
      error instanceof Error ? error.message : "Failed to verify account"
    );
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");
  return !!(token && user);
}

/**
 * Get stored user data
 */
export function getStoredUser(): User | null {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      localStorage.removeItem("user");
      return null;
    }
  }
  return null;
}
/**
 * Google OAuth login - Redirects to Google OAuth consent screen
 */
export function googleLogin(): void {
  const backendUrl = import.meta.env.VITE_API_URL;
  window.location.href = `${backendUrl}/api/auth/google`;
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

/**
 * Clear all stored auth data
 */
export function clearAuthData(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
}
