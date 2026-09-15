import React, { useState, useEffect } from "react";
import { bookingApi, residentApi } from "../../services/api";
import { MealBooking, Resident, MealType } from "../../types";
import {
  CheckCircle2,
  Clock,
  Search,
  Users,
  Utensils,
  Building2,
  Calendar,
  Sparkles,
} from "lucide-react";

interface StaffAttendancePageProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const StaffAttendancePage: React.FC<StaffAttendancePageProps> = ({ onShowToast }) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMeal, setSelectedMeal] = useState<MealType>("LUNCH");
  const [bookings, setBookings] = useState<MealBooking[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [servedMap, setServedMap] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookData, resData] = await Promise.all([
          bookingApi.getBookings({ date: selectedDate }),
          residentApi.getAll(),
        ]);
        setBookings(bookData);
        setResidents(resData);
      } catch (err) {
        console.error(err);
        onShowToast("Failed to load counter attendance", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  // Filter residents who booked YES for selected meal
  const confirmedAttendees = residents
    .map((r) => {
      const b = bookings.find(
        (item) => item.residentId === r.residentId && item.mealType === selectedMeal
      );
      return {
        resident: r,
        status: b ? b.status : "PENDING",
      };
    })
    .filter((a) => a.status === "YES");

  const toggleServed = (residentId: string, name: string) => {
    const isCurrentlyServed = !!servedMap[residentId];
    setServedMap((prev) => ({
      ...prev,
      [residentId]: !isCurrentlyServed,
    }));
    if (!isCurrentlyServed) {
      onShowToast(`Marked ${name} as served!`, "success");
    }
  };

  const servedCount = confirmedAttendees.filter((a) => servedMap[a.resident.residentId]).length;
  const remainingCount = Math.max(0, confirmedAttendees.length - servedCount);

  const filteredAttendees = confirmedAttendees.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      a.resident.name.toLowerCase().includes(term) ||
      a.resident.residentId.toLowerCase().includes(term) ||
      a.resident.roomNumber.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Serving Counter Check-in & Live Serving
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Counter Live Attendance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tap "Mark Served" when each confirmed resident collects their plate at the counter.
          </p>
        </div>

        {/* Meal Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          {(["BREAKFAST", "LUNCH", "DINNER"] as MealType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedMeal(type)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedMeal === type
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Serving Progress Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Expected Attendees (Yes)
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {confirmedAttendees.length} residents
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pre-confirmed meal count</div>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Plates Served So Far
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {servedCount} served
          </div>
          <div className="text-[11px] text-emerald-800 mt-0.5 font-medium">
            {confirmedAttendees.length > 0
              ? Math.round((servedCount / confirmedAttendees.length) * 100)
              : 0}
            % completed
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Remaining in Queue
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {remainingCount} yet to arrive
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Awaiting counter pickup</div>
        </div>
      </div>

      {/* Attendees Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search resident name or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Showing {filteredAttendees.length} of {confirmedAttendees.length} confirmed
        </div>
      </div>

      {/* Manifest Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading attendee list...</div>
        ) : filteredAttendees.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No confirmed residents found for {selectedMeal}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Resident ID</th>
                  <th className="py-3.5 px-4">Resident Name</th>
                  <th className="py-3.5 px-4">Room</th>
                  <th className="py-3.5 px-4">Booking Verification</th>
                  <th className="py-3.5 px-4">Counter Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAttendees.map(({ resident }) => {
                  const isServed = !!servedMap[resident.residentId];

                  return (
                    <tr
                      key={resident.id}
                      className={`transition-colors ${
                        isServed ? "bg-emerald-50/40" : "hover:bg-slate-50/60"
                      }`}
                    >
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
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Pre-Confirmed (YES)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isServed ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Plate Collected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 font-medium">
                            <Clock className="w-4 h-4 text-slate-300" />
                            Awaiting Serving
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => toggleServed(resident.residentId, resident.name)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isServed
                              ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                              : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs shadow-emerald-200"
                          }`}
                        >
                          {isServed ? "Undo Served" : "Mark as Served"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
