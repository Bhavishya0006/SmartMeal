import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { bookingApi } from "../../services/api";
import { MealBooking } from "../../types";
import { History, Calendar, Check, X, Filter } from "lucide-react";

export const MealHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const residentId = user?.residentId || "RES-101";
  const [history, setHistory] = useState<MealBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMeal, setFilterMeal] = useState<string>("ALL");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await bookingApi.getBookings({ residentId });
        setHistory(data);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [residentId]);

  const filtered = history.filter((item) => {
    if (filterMeal === "ALL") return true;
    return item.mealType === filterMeal;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meal Booking History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log of your past meal confirmations and decisions.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterMeal}
            onChange={(e) => setFilterMeal(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Meals</option>
            <option value="BREAKFAST">Breakfast Only</option>
            <option value="LUNCH">Lunch Only</option>
            <option value="DINNER">Dinner Only</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading your booking records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No booking history found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Meal Type</th>
                  <th className="py-3.5 px-4">Decision</th>
                  <th className="py-3.5 px-4">Recorded At</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {row.date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {row.mealType}
                    </td>
                    <td className="py-3.5 px-4">
                      {row.status === "YES" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" />
                          Yes (Eating)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                          <X className="w-3 h-3" />
                          No (Skipped)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {row.updatedAt || "N/A"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Recorded in System
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
