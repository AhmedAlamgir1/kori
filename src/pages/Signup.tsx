import React, { useState } from "react";
import { Link } from "react-router-dom";

interface SignupFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const [form, setForm] = useState<SignupFormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    console.log("Signup Submitted:", form);
    // You can add API call logic here
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
            className="w-full py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
          >
            Sign Up
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
