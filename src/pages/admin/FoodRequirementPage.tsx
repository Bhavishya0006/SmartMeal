import React, { useState, useEffect } from "react";
import { foodRequirementApi, bookingApi, residentApi } from "../../services/api";
import { FoodRequirementData, MealType, MealBooking, Resident } from "../../types";
import {
  ChefHat,
  Calculator,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Info,
  TrendingDown,
  Building2,
} from "lucide-react";

interface FoodRequirementPageProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const FoodRequirementPage: React.FC<FoodRequirementPageProps> = ({ onShowToast }) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [activeMealType, setActiveMealType] = useState<MealType>("LUNCH");
  const [data, setData] = useState<FoodRequirementData | null>(null);
  const [bookings, setBookings] = useState<MealBooking[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (date: string) => {
    setLoading(true);
    try {
      const [reqData, bookData, resData] = await Promise.all([
        foodRequirementApi.get(date),
        bookingApi.getBookings({ date }),
        residentApi.getAll(),
      ]);
      setData(reqData);
      setBookings(bookData);
      setResidents(resData);
    } catch (err) {
      console.error(err);
      onShowToast("Failed to fetch food requirement calculations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        Calculating live food requirements...
      </div>
    );
  }

  const activeReq =
    activeMealType === "BREAKFAST"
      ? data.breakfast
      : activeMealType === "LUNCH"
      ? data.lunch
      : data.dinner;

  // Build attendee status list for the active meal
  const attendeeList = residents.map((r) => {
    const booking = bookings.find(
      (b) => b.residentId === r.residentId && b.mealType === activeMealType
    );
    return {
      resident: r,
      status: booking ? booking.status : "PENDING",
      updatedAt: booking ? booking.updatedAt : "—",
    };
  });

  const confirmedCount = attendeeList.filter((a) => a.status === "YES").length;
  const skippedCount = attendeeList.filter((a) => a.status === "NO").length;
  const pendingCount = attendeeList.filter((a) => a.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Food Requirement & Head-Count Calculation
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Automatic Demand Sizing
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Section 18 Logic: The system automatically calculates exactly how much food to prepare based on verified "YES" confirmations.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-slate-800 font-bold focus:outline-none"
          />
        </div>
      </div>

      {/* Meal Type Tabs */}
      <div className="flex p-1 bg-slate-200/70 rounded-2xl max-w-md">
        {(["BREAKFAST", "LUNCH", "DINNER"] as MealType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setActiveMealType(type)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeMealType === type
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Formula & Calculation Breakdown Box */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Residents
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {data.totalResidents}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Registered PG occupants
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Confirmed "YES" Count
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 mt-1">
            {activeReq.confirmedYes}
          </div>
          <div className="text-[11px] text-emerald-800 mt-0.5 font-medium">
            Expected {activeMealType.toLowerCase()} attendees
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Skipped ("NO" Count)
          </div>
          <div className="text-2xl font-extrabold text-slate-700 mt-1">
            {activeReq.confirmedNo}
          </div>
          <div className="text-[11px] text-rose-600 font-semibold mt-0.5">
            Saved: {activeReq.confirmedNo} meals NOT cooked!
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 shadow-md text-white">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <ChefHat className="w-4 h-4 text-emerald-400" />
            <span>Kitchen Target</span>
          </div>
          <div className="text-3xl font-black text-white mt-1">
            {activeReq.recommendedPreparation} <span className="text-xs font-normal text-indigo-200">plates</span>
          </div>
          <div className="text-[11px] text-indigo-200 mt-0.5">
            Buffer: +{activeReq.bufferPlates} plates ({data.bufferPercentage}%)
          </div>
        </div>
      </div>

      {/* Head-Count Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Resident Head-Count Manifest for {activeMealType}
            </h3>
            <p className="text-xs text-slate-500">
              Complete roster showing who is dining and who has opted out.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {confirmedCount} Yes
            </span>
            <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {skippedCount} No
            </span>
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {pendingCount} Pending
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Resident ID</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Room</th>
                <th className="py-3.5 px-4">Confirmation Decision</th>
                <th className="py-3.5 px-4">Response Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {attendeeList.map(({ resident, status, updatedAt }) => (
                <tr key={resident.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-indigo-700">
                    {resident.residentId}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {resident.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      Room {resident.roomNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {status === "YES" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3.5 h-3.5" />
                        YES (Will Eat)
                      </span>
                    )}
                    {status === "NO" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                        <XCircle className="w-3.5 h-3.5" />
                        NO (Skipping)
                      </span>
                    )}
                    {status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Response
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {updatedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
