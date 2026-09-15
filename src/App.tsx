import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Sidebar, NavTab } from "./components/Sidebar";
import { ToastContainer, ToastMessage } from "./components/Toast";
import { Login } from "./pages/Login";

// Resident Pages
import { ResidentDashboard } from "./pages/resident/ResidentDashboard";
import { MealBookingPage } from "./pages/resident/MealBookingPage";
import { MealHistoryPage } from "./pages/resident/MealHistoryPage";
import { ResidentProfilePage } from "./pages/resident/ResidentProfilePage";
import { ResidentFeedbackPage } from "./pages/resident/ResidentFeedbackPage";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ResidentsPage } from "./pages/admin/ResidentsPage";
import { RoomsPage } from "./pages/admin/RoomsPage";
import { MenuManagementPage } from "./pages/admin/MenuManagementPage";
import { FoodRequirementPage } from "./pages/admin/FoodRequirementPage";
import { InventoryPage } from "./pages/admin/InventoryPage";
import { FoodWastePage } from "./pages/admin/FoodWastePage";
import { ReportsPage } from "./pages/admin/ReportsPage";
import { FeedbackPage } from "./pages/admin/FeedbackPage";
import { DeadlineSettingsPage } from "./pages/admin/DeadlineSettingsPage";
import { BackendArchitecturePage } from "./pages/admin/BackendArchitecturePage";

// Staff Pages
import { StaffDashboard } from "./pages/staff/StaffDashboard";
import { StaffAttendancePage } from "./pages/staff/StaffAttendancePage";

const MainLayout: React.FC = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("admin-dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync default tab when role changes
  useEffect(() => {
    if (role === "ADMIN") {
      setActiveTab("admin-dashboard");
    } else if (role === "RESIDENT") {
      setActiveTab("resident-dashboard");
    } else if (role === "STAFF") {
      setActiveTab("staff-dashboard");
    }
  }, [role]);

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      // Resident Routes
      case "resident-dashboard":
        return (
          <ResidentDashboard
            onNavigateToBooking={() => setActiveTab("resident-booking")}
            onNavigateToFeedback={() => setActiveTab("resident-feedback")}
          />
        );
      case "resident-booking":
        return <MealBookingPage onShowToast={showToast} />;
      case "resident-history":
        return <MealHistoryPage />;
      case "resident-feedback":
        return <ResidentFeedbackPage onShowToast={showToast} />;
      case "resident-profile":
        return <ResidentProfilePage onShowToast={showToast} />;

      // Admin Routes
      case "admin-dashboard":
        return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case "admin-residents":
        return <ResidentsPage onShowToast={showToast} />;
      case "admin-rooms":
        return <RoomsPage onShowToast={showToast} />;
      case "admin-menu":
        return <MenuManagementPage onShowToast={showToast} />;
      case "admin-requirements":
        return <FoodRequirementPage onShowToast={showToast} />;
      case "admin-inventory":
        return <InventoryPage onShowToast={showToast} />;
      case "admin-waste":
        return <FoodWastePage onShowToast={showToast} />;
      case "admin-reports":
        return <ReportsPage onShowToast={showToast} />;
      case "admin-feedback":
        return <FeedbackPage onShowToast={showToast} />;
      case "admin-settings":
        return <DeadlineSettingsPage onShowToast={showToast} />;
      case "architecture":
        return <BackendArchitecturePage />;

      // Staff Routes
      case "staff-dashboard":
        return <StaffDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case "staff-preparation":
        return <FoodRequirementPage onShowToast={showToast} />;
      case "staff-attendance":
        return <StaffAttendancePage onShowToast={showToast} />;
      case "staff-waste":
        return <FoodWastePage onShowToast={showToast} />;
      case "staff-inventory":
        return <InventoryPage onShowToast={showToast} />;

      default:
        return (
          <div className="p-8 text-center text-slate-400">
            Page not found. Please select a valid navigation tab.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
