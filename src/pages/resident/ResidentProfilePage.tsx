import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/api";
import {
  UserCheck,
  Building2,
  Mail,
  Phone,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface ResidentProfilePageProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const ResidentProfilePage: React.FC<ResidentProfilePageProps> = ({ onShowToast }) => {
  const { user, updateUser } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!oldPassword || !newPassword) {
      setMessage({ type: "error", text: "Please enter both old and new passwords." });
      return;
    }

    if (newPassword.length < 4) {
      setMessage({ type: "error", text: "New password must be at least 4 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    if (!user) return;

    setIsSubmitting(true);
    try {
      await authApi.changePassword(user.id, oldPassword, newPassword);
      updateUser({ hasChangedPassword: true });
      setMessage({ type: "success", text: "Your password has been changed successfully!" });
      onShowToast("Password updated successfully!", "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to change password. Check your current password.";
      setMessage({ type: "error", text: errorMsg });
      onShowToast(errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Resident Profile & Security</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View your registered PG resident details and update your login password.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Profile Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="text-center pb-5 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 font-bold text-2xl mx-auto flex items-center justify-center border border-emerald-200 shadow-xs mb-3">
              {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
            </div>
            <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
            <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ID: {user?.residentId || "RES-101"}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-2 text-slate-500">
                <Building2 className="w-4 h-4 text-slate-400" />
                Assigned Room
              </span>
              <span className="font-bold text-slate-800">
                Room {user?.roomNumber || "101"}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-2 text-slate-500">
                <Mail className="w-4 h-4 text-slate-400" />
                Registered Email
              </span>
              <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                {user?.email}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                Account Status
              </span>
              <span className="font-bold text-emerald-600">Active</span>
            </div>
          </div>
        </div>

        {/* Right: Password Change Form */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-5">
            <KeyRound className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Change Account Password</h3>
              <p className="text-xs text-slate-500">
                Replace your temporary password issued by admin with a secure personal password.
              </p>
            </div>
          </div>

          {message && (
            <div
              className={`mb-4 p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Current / Temporary Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Enter current password (demo: resident123)"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="At least 4 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="change-password-submit-btn"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-200 disabled:opacity-50"
              >
                {isSubmitting ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
