import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { menuApi, bookingApi, settingsApi } from "../../services/api";
import { MenuItem, MealBooking, SystemSettings, MealType, BookingStatus } from "../../types";
import {
  Utensils,
  Sun,
  CloudSun,
  Moon,
  Clock,
  Check,
  X,
  AlertCircle,
  Calendar,
  Sparkles,
  ShieldAlert,
  Info,
} from "lucide-react";

interface MealBookingPageProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const MealBookingPage: React.FC<MealBookingPageProps> = ({ onShowToast }) => {
  const { user } = useAuth();
  const residentId = user?.residentId || "RES-101";

  const [todayStr, setTodayStr] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [bookings, setBookings] = useState<MealBooking[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingMeal, setSavingMeal] = useState<MealType | null>(null);

  const loadData = async (date: string) => {
    setLoading(true);
    try {
      const [menuData, bookingData, settingData] = await Promise.all([
        menuApi.getMenu(date),
        bookingApi.getBookings({ date, residentId }),
        settingsApi.get(),
      ]);
      setMenus(menuData);
      setBookings(bookingData);
      setSettings(settingData);
    } catch (err) {
      console.error("Failed to load booking data:", err);
      onShowToast("Could not load menu details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  const handleBookingToggle = async (mealType: MealType, status: BookingStatus) => {
    setSavingMeal(mealType);
    try {
      const updated = await bookingApi.submitBooking({
        residentId,
        date: selectedDate,
        mealType,
        status,
      });

      // Update local bookings state
      setBookings((prev) => {
        const filtered = prev.filter((b) => b.mealType !== mealType);
        return [...filtered, updated];
      });

      onShowToast(
        `Your ${mealType.toLowerCase()} response is saved as "${status}"!`,
        "success"
      );
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Booking failed. Booking may be closed for today.";
      onShowToast(msg, "error");
    } finally {
      setSavingMeal(null);
    }
  };

  const getMealBooking = (type: MealType): BookingStatus | null => {
    const found = bookings.find((b) => b.mealType === type);
    return found ? found.status : null;
  };

  const isClosed = (mealType: MealType): boolean => {
    if (!settings || !settings.enforceDeadlines) return false;
    const now = new Date();
    const isPastDate = selectedDate < todayStr;
    if (isPastDate) return true;
    if (selectedDate > todayStr) return false;

    let deadlineStr = settings.breakfastDeadline;
    if (mealType === "LUNCH") deadlineStr = settings.lunchDeadline;
    if (mealType === "DINNER") deadlineStr = settings.dinnerDeadline;

    const [hours, minutes] = deadlineStr.split(":").map(Number);
    const deadline = new Date();
    deadline.setHours(hours, minutes, 0, 0);

    return now > deadline;
  };

  const mealCards: Array<{
    type: MealType;
    title: string;
    icon: React.ReactNode;
    color: string;
    time: string;
    deadline: string;
  }> = [
    {
      type: "BREAKFAST",
      title: "Breakfast",
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      color: "border-amber-200 bg-amber-50/40",
      time: settings?.breakfastTime || "08:00 AM - 09:30 AM",
      deadline: settings?.breakfastDeadline || "07:30 AM",
    },
    {
      type: "LUNCH",
      title: "Lunch",
      icon: <CloudSun className="w-5 h-5 text-orange-500" />,
      color: "border-orange-200 bg-orange-50/40",
      time: settings?.lunchTime || "01:00 PM - 02:30 PM",
      deadline: settings?.lunchDeadline || "11:30 AM",
    },
    {
      type: "DINNER",
      title: "Dinner",
      icon: <Moon className="w-5 h-5 text-indigo-500" />,
      color: "border-indigo-200 bg-indigo-50/40",
      time: settings?.dinnerTime || "08:00 PM - 09:30 PM",
      deadline: settings?.dinnerDeadline || "05:30 PM",
    },
  ];

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Daily Meal Confirmation
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Yes / No Only
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Confirm whether you will eat each meal to help the mess team prepare
            the exact required quantity and eliminate food wastage.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
          <Calendar className="w-4 h-4 text-slate-500 ml-1.5" />
          <button
            type="button"
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              selectedDate === todayStr
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Today ({todayStr.slice(5)})
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(tomorrowStr)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              selectedDate === tomorrowStr
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tomorrow ({tomorrowStr.slice(5)})
          </button>
        </div>
      </div>

      {/* Strict Requirement Notice Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900">
          <p className="font-bold">
            Zero Food Waste Initiative: Direct Head-Count Accuracy
          </p>
          <p className="mt-0.5 text-emerald-800">
            Per PG rules, there is <strong>no portion/plate quantity selection</strong>.
            Simply mark <strong>YES</strong> if you plan to eat, or <strong>NO</strong> if
            you are skipping or dining outside. The kitchen prepares meals based directly on
            the total "Yes" count.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
          Loading daily menu and booking options...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mealCards.map((card) => {
            const menu = menus.find((m) => m.mealType === card.type);
            const currentStatus = getMealBooking(card.type);
            const closed = isClosed(card.type);
            const isSaving = savingMeal === card.type;

            return (
              <div
                key={card.type}
                id={`meal-card-${card.type.toLowerCase()}`}
                className={`bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden transition-all hover:shadow-md ${
                  currentStatus === "YES"
                    ? "ring-2 ring-emerald-500 border-transparent"
                    : currentStatus === "NO"
                    ? "ring-1 ring-slate-300"
                    : ""
                }`}
              >
                {/* Header */}
                <div className={`p-5 border-b border-slate-100 ${card.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white rounded-xl shadow-xs">
                        {card.icon}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">
                          {card.title}
                        </h2>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{menu?.mealTime || card.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {currentStatus === "YES" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                          Confirmed
                        </span>
                      )}
                      {currentStatus === "NO" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                          <X className="w-3.5 h-3.5" />
                          Skipped
                        </span>
                      )}
                      {!currentStatus && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Deadline Notice */}
                  <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 text-slate-600">
                    <span>Booking Deadline:</span>
                    <span className="font-bold text-slate-800">
                      {menu?.bookingDeadline || card.deadline}
                    </span>
                  </div>
                </div>

                {/* Body: Food Items */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Today's Menu:
                    </div>
                    {menu && menu.items && menu.items.length > 0 ? (
                      <ul className="space-y-1.5">
                        {menu.items.map((dish, idx) => (
                          <li
                            key={idx}
                            className="text-xs font-semibold text-slate-700 flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{dish}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Standard mess meal will be served.
                      </p>
                    )}
                  </div>

                  {/* Booking Action */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-800 mb-2.5 text-center">
                      Will you eat {card.title.toLowerCase()}?
                    </p>

                    {closed ? (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center text-xs text-rose-700 font-semibold flex items-center justify-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        <span>Meal booking is closed for today.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          id={`btn-${card.type.toLowerCase()}-yes`}
                          disabled={isSaving}
                          onClick={() => handleBookingToggle(card.type, "YES")}
                          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                            currentStatus === "YES"
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          } disabled:opacity-50`}
                        >
                          <Check className="w-4 h-4" />
                          <span>Yes, I will eat</span>
                        </button>

                        <button
                          type="button"
                          id={`btn-${card.type.toLowerCase()}-no`}
                          disabled={isSaving}
                          onClick={() => handleBookingToggle(card.type, "NO")}
                          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                            currentStatus === "NO"
                              ? "bg-slate-800 text-white shadow-md"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                          } disabled:opacity-50`}
                        >
                          <X className="w-4 h-4" />
                          <span>No, skipping</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
