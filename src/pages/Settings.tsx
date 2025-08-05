import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Home as HomeIcon,
  LogOut,
} from "lucide-react";
import { changePassword, deleteAccount } from "@/utils/api/authApi";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/");
  };
  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
    );

    if (!isConfirmed) {
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const res = await deleteAccount(user?._id);
    if (res?.statusCode === 200) {
      toast.success("Account deleted successfully");
      localStorage.clear();
      navigate("/");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      if (res?.statusCode === 200) {
        toast.success("Password changed successfully");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login");
      } else if (res?.statusCode === 400) {
        setError(
          res?.data?.errors?.[0]?.message || "Failed to change password"
        );
      } else if (res?.statusCode === 401) {
        setError(res?.message || "Failed to change password");
      }
    } catch (err: any) {
      if (typeof err === "object" && err !== null && err.message) {
        setError(err.message);
      } else {
        setError("Failed to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-slate-900 to-indigo-900 text-white">
      <aside className="w-64 bg-slate-800/50 backdrop-blur-md border-r border-indigo-500/30 p-6 hidden md:block">
        <h1 className="text-2xl font-bold mb-10 text-center">Kori Dashboard</h1>
        <nav className="space-y-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 text-white hover:text-indigo-400 transition"
          >
            <HomeIcon /> Dashboard
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 text-white hover:text-indigo-400 transition"
          >
            <SettingsIcon /> Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-white hover:text-red-400 transition w-full text-left"
          >
            <LogOut /> Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-slate-800/60 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Account Settings
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">New Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-700 transition font-semibold text-white mt-2"
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>

          <div className="mt-10 border-t border-indigo-500/20 pt-6">
            <h3 className="text-lg font-bold mb-2 text-red-400">Danger Zone</h3>
            <button
              className="w-full py-2 rounded bg-red-600 hover:bg-red-700 transition font-semibold text-white cursor-pointer"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
