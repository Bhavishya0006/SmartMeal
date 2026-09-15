import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  UtensilsCrossed,
  LogOut,
  Shield,
  UserCheck,
  ChefHat,
  Menu as MenuIcon,
  X,
  Code2,
  Clock,
  Building2,
} from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenArchitecture?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenArchitecture }) => {
  const { user, role, quickLogin, logout } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleRoleSwitch = async (newRole: "ADMIN" | "RESIDENT" | "STAFF") => {
    if (role === newRole) return;
    setIsSwitching(true);
    try {
      await quickLogin(newRole);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSwitching(false);
    }
  };

  const getRoleBadge = () => {
    switch (role) {
      case "ADMIN":
        return {
          label: "PG Administrator",
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: <Shield className="w-3.5 h-3.5 mr-1" />,
        };
      case "STAFF":
        return {
          label: "Kitchen / Mess Staff",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <ChefHat className="w-3.5 h-3.5 mr-1" />,
        };
      case "RESIDENT":
      default:
        return {
          label: "Resident",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <UserCheck className="w-3.5 h-3.5 mr-1" />,
        };
    }
  };

  const badge = getRoleBadge();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="mobile-menu-btn"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  Smart<span className="text-emerald-600">Meal</span>
                </span>
                <span className="hidden sm:inline-flex text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  PG Mess System
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                Smart Food Management & Waste Reduction
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick Role Switcher for seamless demonstration */}
        <div className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs">
          <span className="px-2 py-1 text-slate-500 font-semibold text-[11px]">
            Demo Role:
          </span>
          <button
            type="button"
            id="role-switch-admin"
            disabled={isSwitching}
            onClick={() => handleRoleSwitch("ADMIN")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              role === "ADMIN"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </button>
          <button
            type="button"
            id="role-switch-resident"
            disabled={isSwitching}
            onClick={() => handleRoleSwitch("RESIDENT")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              role === "RESIDENT"
                ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Resident
          </button>
          <button
            type="button"
            id="role-switch-staff"
            disabled={isSwitching}
            onClick={() => handleRoleSwitch("STAFF")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              role === "STAFF"
                ? "bg-white text-amber-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            Kitchen Staff
          </button>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-2.5">
          {onOpenArchitecture && (
            <button
              type="button"
              id="view-spring-boot-architecture-btn"
              onClick={onOpenArchitecture}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
              title="Inspect Java Spring Boot Backend Architecture & MySQL Schema"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Spring Boot Code</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-800 leading-tight">
                {user?.name}
              </div>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span
                  className={`inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded border ${badge.bg}`}
                >
                  {badge.icon}
                  {badge.label}
                </span>
                {user?.roomNumber && (
                  <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    <Building2 className="w-2.5 h-2.5 mr-0.5" />
                    Rm {user.roomNumber}
                  </span>
                )}
              </div>
            </div>

            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <button
              type="button"
              id="navbar-logout-btn"
              onClick={logout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
