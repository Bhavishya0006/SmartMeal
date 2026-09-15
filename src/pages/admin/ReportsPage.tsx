import React, { useState, useEffect } from "react";
import { reportApi } from "../../services/api";
import { ReportsData } from "../../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Download,
} from "lucide-react";

interface ReportsPageProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onShowToast }) => {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportRange, setReportRange] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("WEEKLY");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await reportApi.getReports();
        setReports(data);
      } catch (err) {
        console.error(err);
        onShowToast("Failed to load reports data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const weeklyTrendData = reports?.weeklyTrend || (reports as any)?.weeklyTrends || [];

  const handleExportCSV = () => {
    if (!reports) return;
    const headers = ["Day", "Date", "Confirmed", "Prepared", "Served", "Wasted", "WastePct"];
    const rows = weeklyTrendData.map((d: any) =>
      [d.day, d.date, d.confirmed, d.prepared, d.served, d.waste ?? d.wasted, d.wastePct].join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smartmeal_report_${reportRange.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast("Report exported successfully as CSV!", "success");
  };

  if (loading || !reports) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        Generating reports & visual analytics...
      </div>
    );
  }

  const s = reports.summary;
  const totalConfirmed = s.todayConfirmedTotal ?? (s as any).totalConfirmedBookings ?? 0;
  const totalResidents = s.totalResidents || 70;
  const breakfastCount = reports.today?.breakfast?.confirmedYes ?? 52;
  const lunchCount = reports.today?.lunch?.confirmedYes ?? 48;
  const dinnerCount = reports.today?.dinner?.confirmedYes ?? 58;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Operational Reports & Food Waste Analytics
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              Daily / Weekly / Monthly
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Section 21 Report Suite: Measure head-count accuracy, plates served, and food wastage percentages over time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Period selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setReportRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  reportRange === range
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Highlight Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Confirmed Today
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {totalConfirmed}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Yes responses recorded</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Meals Prepared
          </div>
          <div className="text-2xl font-extrabold text-indigo-700 mt-1">
            {s.mealsPrepared} plates
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Kitchen output total</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Meals Served
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {s.mealsServed} plates
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">Successfully eaten</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Average Waste Rate
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {s.averageWastePct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Target: &lt; 5.0%</div>
        </div>
      </div>

      {/* Primary Chart 1: Prepared vs Served vs Wasted */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Kitchen Preparation vs Actual Served vs Wasted (Plates)
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates how closely actual meal cooking matched attendance and prevented leftover surplus.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-indigo-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" /> Prepared
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Served
            </span>
            <span className="flex items-center gap-1 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Wasted
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyTrendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="prepared" name="Prepared" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="served" name="Served" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="waste" name="Wasted" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Primary Chart 2: Waste Percentage Trend (%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Food Wastage Percentage Trend
            </h3>
            <p className="text-xs text-slate-500">
              Daily percentage of cooked food that was discarded (Goal: strictly under 5%).
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyTrendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis unit="%" tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} domain={[0, 10]} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, "Waste Rate"]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="wastePct"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#wasteGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meal Type Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Meal Confirmation Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Total confirmed plates per meal slot today.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Breakfast (08:00 AM)</span>
                <span>{breakfastCount} plates</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((breakfastCount / totalResidents) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Lunch (01:00 PM)</span>
                <span>{lunchCount} plates</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((lunchCount / totalResidents) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Dinner (08:00 PM)</span>
                <span>{dinnerCount} plates</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((dinnerCount / totalResidents) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
