import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, RegisterRequest } from "@/utils/api/authApi";

interface SignupFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<SignupFormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Password strength validation
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      setError("Password must contain at least one lowercase letter, one uppercase letter, and one number.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userData: RegisterRequest = {
        fullName: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      };

      const result = await register(userData);
      
      // Registration successful - user is automatically logged in
      console.log("Registration successful:", result);
      
      // Redirect to dashboard or home page
      navigate('/dashboard');
    } catch (error) {
      console.error("Registration failed:", error);
      // Error message is already handled by the authApi with toast notifications
      setError(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-indigo-900 text-white">
      <div className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-indigo-500/30">
        <h2 className="text-2xl font-bold text-center text-white">Create an Account</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-3">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full border rounded-lg p-4 border-blue-500 bg-blue-500/10 text-sm font-medium"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-3">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full border rounded-lg p-4 border-blue-500 bg-blue-500/10 text-sm font-medium"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-3">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="w-full border rounded-lg p-4 border-blue-500 bg-blue-500/10 text-sm font-medium"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-4 text-sm text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-3">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="w-full border rounded-lg p-4 border-blue-500 bg-blue-500/10 text-sm font-medium"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-300">
          Already have an account? <Link to={'/login'} className="text-white hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
