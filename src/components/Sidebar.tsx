import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  Utensils,
  Calculator,
  Package,
  Trash2,
  BarChart3,
  MessageSquareQuote,
  Clock,
  Code2,
  History,
  UserCheck,
  ChefHat,
  CheckCircle2,
  Settings,
} from "lucide-react";

export type NavTab =
  // Admin Tabs
  | "admin-dashboard"
  | "admin-residents"
  | "admin-rooms"
  | "admin-menu"
  | "admin-requirements"
  | "admin-inventory"
  | "admin-waste"
  | "admin-reports"
  | "admin-feedback"
  | "admin-settings"
  | "architecture"
  // Resident Tabs
  | "resident-dashboard"
  | "resident-booking"
  | "resident-history"
  | "resident-profile"
  | "resident-feedback"
  // Staff Tabs
  | "staff-dashboard"
  | "staff-preparation"
  | "staff-attendance"
  | "staff-waste"
  | "staff-inventory";

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const { role, user } = useAuth();

  const handleTabClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const renderAdminNav = () => (
    <div className="space-y-6">
      <div>
        <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>
        <nav className="space-y-1">
          <button
            type="button"
            id="nav-admin-dashboard"
            onClick={() => handleTabClick("admin-dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "admin-dashboard"
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-600" />
            <span>Admin Dashboard</span>
          </button>
          <button
            type="button"
            id="nav-admin-residents"
            onClick={() => handleTabClick("admin-residents")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "admin-residents"
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Residents Management</span>
          </button>
          <button
            type="button"
            id="nav-admin-rooms"
            onClick={() => handleTabClick("admin-rooms")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "admin-rooms"
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Rooms & Occupancy</span>
          </button>
        </nav>
      </div>

      <div>
        <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Meal & Kitchen Control
        </div>
        <nav className="space-y-1">
          <button
            type="button"
            id="nav-admin-menu"
            onClick={() => handleTabClick("admin-menu")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "admin-menu"
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Utensils className="w-4 h-4 text-indigo-600" />
            <span>Menu Management</span>
          </button>
          <button
            type="button"
            id="nav-admin-requirements"
            onClick={() => handleTabClick("admin-requirements")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "admin-requirements"
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>Food Requirement</span>
          </button>
          <button
            type="button"
            id="nav-admin-inventory"
            onClick={() => handleTabClick("admin-inventory")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "admin-inventory"
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Package className="w-4 h-4 text-indigo-600" />
            <span>Inventory Management</span>
          </button>
          <button
            type="button"
            id="nav-admin-waste"
            onClick={() => handleTabClick("admin-waste")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "admin-waste"
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Trash2 className="w-4 h-4 text-indigo-600" />
            <span>Food Waste Tracking</span>
          </button>
        </nav>
      </div>

      <div>
        <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Analytics & Quality
        </div>
        <nav className="space-y-1">
          <button
            type="button"
            id="nav-admin-reports"
            onClick={() => handleTabClick("admin-reports")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "admin-reports"
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Reports & Analytics</span>
          </button>
          <button
            type="button"
            id="nav-admin-feedback"
            onClick={() => handleTabClick("admin-feedback")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "admin-feedback"
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <MessageSquareQuote className="w-4 h-4 text-indigo-600" />
            <span>Resident Feedback</span>
          </button>
          <button
            type="button"
            id="nav-admin-settings"
            onClick={() => handleTabClick("admin-settings")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "admin-settings"
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Booking Deadlines</span>
          </button>
          <button
            type="button"
            id="nav-architecture"
            onClick={() => handleTabClick("architecture")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "architecture"
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span className="flex items-center justify-between w-full">
              Spring Boot Code
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                Java
              </span>
            </span>
          </button>
        </nav>
      </div>
    </div>
  );

  const renderResidentNav = () => (
    <div className="space-y-6">
      <div>
        <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          My Meals
        </div>
        <nav className="space-y-1">
          <button
            type="button"
            id="nav-resident-dashboard"
            onClick={() => handleTabClick("resident-dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "resident-dashboard"
                ? "bg-emerald-50 text-emerald-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
            <span>My Overview</span>
          </button>
          <button
            type="button"
            id="nav-resident-booking"
            onClick={() => handleTabClick("resident-booking")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "resident-booking"
                ? "bg-emerald-50 text-emerald-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span>Today's Menu & Booking</span>
          </button>
          <button
            type="button"
            id="nav-resident-history"
            onClick={() => handleTabClick("resident-history")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "resident-history"
                ? "bg-emerald-50 text-emerald-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <History className="w-4 h-4 text-emerald-600" />
            <span>Booking History</span>
          </button>
          <button
            type="button"
            id="nav-resident-feedback"
            onClick={() => handleTabClick("resident-feedback")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "resident-feedback"
                ? "bg-emerald-50 text-emerald-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <MessageSquareQuote className="w-4 h-4 text-emerald-600" />
            <span>Rate Meal Feedback</span>
          </button>
        </nav>
      </div>

      <div>
        <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Account
        </div>
        <nav className="space-y-1">
          <button
            type="button"
            id="nav-resident-profile"
            onClick={() => handleTabClick("resident-profile")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "resident-profile"
                ? "bg-emerald-50 text-emerald-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Profile & Password</span>
          </button>
        </nav>
      </div>
    </div>
  );

  const renderStaffNav = () => (
    <div className="space-y-6">
      <div>
        <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Kitchen Operations
        </div>
        <nav className="space-y-1">
          <button
            type="button"
            id="nav-staff-dashboard"
            onClick={() => handleTabClick("staff-dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "staff-dashboard"
                ? "bg-amber-50 text-amber-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ChefHat className="w-4 h-4 text-amber-600" />
            <span>Kitchen Dashboard</span>
          </button>
          <button
            type="button"
            id="nav-staff-preparation"
            onClick={() => handleTabClick("staff-preparation")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "staff-preparation"
                ? "bg-amber-50 text-amber-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>Expected Meal Count</span>
          </button>
          <button
            type="button"
            id="nav-staff-attendance"
            onClick={() => handleTabClick("staff-attendance")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "staff-attendance"
                ? "bg-amber-50 text-amber-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            <span>Record Served Meals</span>
          </button>
          <button
            type="button"
            id="nav-staff-waste"
            onClick={() => handleTabClick("staff-waste")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "staff-waste"
                ? "bg-amber-50 text-amber-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Trash2 className="w-4 h-4 text-amber-600" />
            <span>Leftover & Waste Log</span>
          </button>
          <button
            type="button"
            id="nav-staff-inventory"
            onClick={() => handleTabClick("staff-inventory")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "staff-inventory"
                ? "bg-amber-50 text-amber-700 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Package className="w-4 h-4 text-amber-600" />
            <span>Stock Inventory</span>
          </button>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-61px)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden">
          <span className="font-bold text-slate-800 text-sm">Navigation</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <span className="sr-only">Close sidebar</span>
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {role === "ADMIN" && renderAdminNav()}
          {role === "RESIDENT" && renderResidentNav()}
          {role === "STAFF" && renderStaffNav()}
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-500">
          <div className="font-semibold text-slate-700 flex items-center justify-between">
            <span>Mess ID: GV-MESS-01</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="mt-0.5 text-slate-400">Green Valley PG & Mess</p>
        </div>
      </aside>
    </>
  );
};
