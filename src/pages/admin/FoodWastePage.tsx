import React, { useState, useEffect } from "react";
import { wasteApi } from "../../services/api";
import { WasteRecord, MealType } from "../../types";
import { Modal } from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import {
  Trash2,
  Plus,
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle2,
  PieChart,
  Sparkles,
} from "lucide-react";

interface FoodWastePageProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const FoodWastePage: React.FC<FoodWastePageProps> = ({ onShowToast }) => {
  const { user } = useAuth();
  const todayStr = new Date().toISOString().split("T")[0];
  const [records, setRecords] = useState<WasteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: todayStr,
    mealType: "LUNCH" as MealType,
    mealsPrepared: 70,
    mealsServed: 67,
    leftoverFood: 3,
    wastedFood: 3,
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await wasteApi.getAll();
      setRecords(data);
    } catch (err) {
      console.error(err);
      onShowToast("Failed to fetch waste records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handlePreparedChange = (val: number) => {
    const prepared = Math.max(0, val);
    const served = Math.min(prepared, formData.mealsServed);
    const diff = Math.max(0, prepared - served);
    setFormData({
      ...formData,
      mealsPrepared: prepared,
      mealsServed: served,
      leftoverFood: diff,
      wastedFood: diff,
    });
  };

  const handleServedChange = (val: number) => {
    const served = Math.max(0, val);
    const diff = Math.max(0, formData.mealsPrepared - served);
    setFormData({
      ...formData,
      mealsServed: served,
      leftoverFood: diff,
      wastedFood: diff,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await wasteApi.create({
        ...formData,
        recordedBy: user?.name || "Kitchen Supervisor",
      });
      onShowToast("Meal service and food waste record logged successfully", "success");
      setIsModalOpen(false);
      fetchRecords();
    } catch (err: any) {
      onShowToast(err.response?.data?.message || "Failed to log waste record", "error");
    } finally {
      setSaving(false);
    }
  };

  const totalPrepared = records.reduce((acc, r) => acc + r.mealsPrepared, 0);
  const totalServed = records.reduce((acc, r) => acc + r.mealsServed, 0);
  const totalWasted = records.reduce((acc, r) => acc + r.wastedFood, 0);
  const avgWastePct =
    totalPrepared > 0 ? Number(((totalWasted / totalPrepared) * 100).toFixed(1)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Food Waste & Leftover Auditing</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
              Section 15 Audit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official logging for meals prepared vs served, surplus leftovers, and exact waste percentages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-rose-200 transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Meal Waste</span>
        </button>
      </div>

      {/* Aggregate KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Prepared
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {totalPrepared} plates
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Recorded historical batches</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Consumed / Served
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {totalServed} plates
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-semibold">
            {totalPrepared > 0 ? Math.round((totalServed / totalPrepared) * 100) : 0}% consumption rate
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Wasted Plates
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">
            {totalWasted} plates
          </div>
          <div className="text-[11px] text-rose-700 mt-0.5">Unconsumed discard</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-300" />
            <span>Overall Waste Rate</span>
          </div>
          <div className="text-3xl font-black text-white mt-1">
            {avgWastePct}%
          </div>
          <div className="text-[11px] text-emerald-200 mt-0.5">
            Formula: (Waste / Prepared) × 100
          </div>
        </div>
      </div>

      {/* Waste Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading food waste logs...</div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No food waste logs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Meal Type</th>
                  <th className="py-3.5 px-4">Prepared</th>
                  <th className="py-3.5 px-4">Served</th>
                  <th className="py-3.5 px-4">Leftover</th>
                  <th className="py-3.5 px-4">Wasted</th>
                  <th className="py-3.5 px-4">Waste %</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {r.date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {r.mealType}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {r.mealsPrepared}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold">
                      {r.mealsServed}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {r.leftoverFood}
                    </td>
                    <td className="py-3.5 px-4 text-rose-600 font-bold">
                      {r.wastedFood}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          r.wastePercentage <= 5
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : r.wastePercentage <= 10
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {r.wastePercentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {r.notes || "Standard meal operation"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {r.recordedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Log Meal Waste (Requirement 15) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Daily Food Service & Waste"
        subtitle="Log actual plates cooked vs consumed to update wastage performance metrics."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Meal Type *
              </label>
              <select
                value={formData.mealType}
                onChange={(e) => setFormData({ ...formData, mealType: e.target.value as MealType })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
              >
                <option value="BREAKFAST">BREAKFAST</option>
                <option value="LUNCH">LUNCH</option>
                <option value="DINNER">DINNER</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Meals Prepared (Cooked) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.mealsPrepared}
                onChange={(e) => handlePreparedChange(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Meals Served (Counter) *
              </label>
              <input
                type="number"
                min={0}
                max={formData.mealsPrepared}
                required
                value={formData.mealsServed}
                onChange={(e) => handleServedChange(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-emerald-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Leftover Food (Plates)
              </label>
              <input
                type="number"
                min={0}
                value={formData.leftoverFood}
                onChange={(e) => setFormData({ ...formData, leftoverFood: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Wasted Food (Plates) *
              </label>
              <input
                type="number"
                min={0}
                value={formData.wastedFood}
                onChange={(e) => setFormData({ ...formData, wastedFood: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-rose-700"
              />
            </div>
          </div>

          {/* Dynamic Live Waste Calculation Indicator */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Calculated Waste %:</span>
            <span className="text-sm font-extrabold text-rose-700">
              {formData.mealsPrepared > 0
                ? ((formData.wastedFood / formData.mealsPrepared) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notes / Reason for Wastage
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Rainy evening, several residents unexpectedly ate outside; or exact booking count matched perfectly."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
            >
              {saving ? "Logging..." : "Log Waste Record"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
