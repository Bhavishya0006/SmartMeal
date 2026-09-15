import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { menuApi, bookingApi, foodRequirementApi } from "../../services/api";
import { MenuItem, MealBooking, MealType, BookingStatus } from "../../types";
import {
  Utensils,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
  Building2,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";

interface ResidentDashboardProps {
  onNavigateToBooking: () => void;
  onNavigateToFeedback: () => void;
}

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({
  onNavigateToBooking,
  onNavigateToFeedback,
}) => {
  const { user } = useAuth();
  const residentId = user?.residentId || "RES-101";

  const todayStr = new Date().toISOString().split("T")[0];
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [bookings, setBookings] = useState<MealBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [menuData, bookingData] = await Promise.all([
          menuApi.getMenu(todayStr),
          bookingApi.getBookings({ date: todayStr, residentId }),
        ]);
        setMenus(menuData);
        setBookings(bookingData);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [residentId, todayStr]);

  const getStatus = (mealType: MealType): BookingStatus | "PENDING" => {
    const b = bookings.find((item) => item.mealType === mealType);
    return b ? b.status : "PENDING";
  };

  const breakfastStatus = getStatus("BREAKFAST");
  const lunchStatus = getStatus("LUNCH");
  const dinnerStatus = getStatus("DINNER");

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 rounded-3xl p-6 lg:p-8 text-white shadow-lg shadow-emerald-900/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/60 border border-emerald-400/30 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-emerald-200" />
            <span>Room {user?.roomNumber || "101"} • Resident ID: {user?.residentId || "RES-101"}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || "Resident"}!
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            SmartMeal helps our PG kitchen avoid cooking surplus food. Your single
            Yes/No confirmation directly informs the chef how many plates to prepare.
          </p>
          <div className="pt-2">
            <button
              type="button"
              id="dash-confirm-meals-btn"
              onClick={onNavigateToBooking}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all"
            >
              <span>Confirm Today's Meals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ambient watermark */}
        <Utensils className="absolute -right-8 -bottom-10 w-64 h-64 text-white/5 pointer-events-none" />
      </div>

      {/* Today's Confirmation Status Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Today's Booking Status
          </h2>
          <span className="text-xs text-slate-400">Date: {todayStr}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Breakfast */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Breakfast
              </span>
              <span className="text-[11px] text-slate-400 font-medium">08:00 - 09:30 AM</span>
            </div>
            <div className="my-3">
              {breakfastStatus === "YES" && (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
                  <CheckCircle className="w-5 h-5" />
                  <span>Eating (Yes)</span>
                </div>
              )}
              {breakfastStatus === "NO" && (
                <div className="flex items-center gap-2 text-slate-500 font-bold text-base">
                  <XCircle className="w-5 h-5 text-slate-400" />
                  <span>Skipping (No)</span>
                </div>
              )}
              {breakfastStatus === "PENDING" && (
                <div className="flex items-center gap-2 text-amber-600 font-bold text-base">
                  <Clock className="w-5 h-5" />
                  <span>Not Selected Yet</span>
                </div>
              )}
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
              <span>Deadline: 07:30 AM</span>
              <button
                type="button"
                onClick={onNavigateToBooking}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Change
              </button>
            </div>
          </div>

          {/* Lunch */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Lunch
              </span>
              <span className="text-[11px] text-slate-400 font-medium">01:00 - 02:30 PM</span>
            </div>
            <div className="my-3">
              {lunchStatus === "YES" && (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
                  <CheckCircle className="w-5 h-5" />
                  <span>Eating (Yes)</span>
                </div>
              )}
              {lunchStatus === "NO" && (
                <div className="flex items-center gap-2 text-slate-500 font-bold text-base">
                  <XCircle className="w-5 h-5 text-slate-400" />
                  <span>Skipping (No)</span>
                </div>
              )}
              {lunchStatus === "PENDING" && (
                <div className="flex items-center gap-2 text-amber-600 font-bold text-base">
                  <Clock className="w-5 h-5" />
                  <span>Not Selected Yet</span>
                </div>
              )}
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
              <span>Deadline: 11:30 AM</span>
              <button
                type="button"
                onClick={onNavigateToBooking}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Change
              </button>
            </div>
          </div>

          {/* Dinner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Dinner
              </span>
              <span className="text-[11px] text-slate-400 font-medium">08:00 - 09:30 PM</span>
            </div>
            <div className="my-3">
              {dinnerStatus === "YES" && (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
                  <CheckCircle className="w-5 h-5" />
                  <span>Eating (Yes)</span>
                </div>
              )}
              {dinnerStatus === "NO" && (
                <div className="flex items-center gap-2 text-slate-500 font-bold text-base">
                  <XCircle className="w-5 h-5 text-slate-400" />
                  <span>Skipping (No)</span>
                </div>
              )}
              {dinnerStatus === "PENDING" && (
                <div className="flex items-center gap-2 text-amber-600 font-bold text-base">
                  <Clock className="w-5 h-5" />
                  <span>Not Selected Yet</span>
                </div>
              )}
            </div>
            <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
              <span>Deadline: 05:30 PM</span>
              <button
                type="button"
                onClick={onNavigateToBooking}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Menu Highlight & Feedback Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Today's Curated Mess Menu
              </h3>
              <p className="text-xs text-slate-500">Prepared fresh daily by mess staff</p>
            </div>
            <button
              type="button"
              onClick={onNavigateToBooking}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Manage Booking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {menus.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {m.mealType}
                  </span>
                  <span className="text-[10px] text-slate-500">{m.mealTime}</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-600">
                  {m.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5 font-medium">
                      <span className="text-emerald-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Community & Feedback widget */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Meal Quality & Taste Feedback
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Help the management improve quality, portion sizes, and weekly dish
              variety. Ratings are reviewed daily by the mess supervisor.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onNavigateToFeedback}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors text-center"
            >
              Give Today's Meal Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
