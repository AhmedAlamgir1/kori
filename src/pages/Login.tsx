import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../utils/api/authApi";

interface LoginFormState {
  email: string;
  password: string;
}

function Login() {
  const [form, setForm] = useState<LoginFormState>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login({
        email: form.email,
        password: form.password,
      });

      navigate("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-indigo-900 text-white">
        <div className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-indigo-500/30">
          <h2 className="text-2xl font-bold text-center text-white">
            Login to Kori
          </h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-3"
              >
                Email
              </label>
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-3"
              >
                Password
              </label>
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

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="text-center mt-4 mb-4">OR</div>

          <button
            onClick={() => navigate("/landing")}
            type="submit"
            className="w-full py-2 text-white bg-gray-500 rounded-lg hover:bg-blue-700 focus:outline-none"
          >
            Continue as a guest
          </button>

          <p className="mt-4 text-sm text-center text-gray-300">
            Don't have an account?{" "}
            <Link to={"/signup"} className="text-white hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
