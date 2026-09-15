import React, { useState, useEffect } from "react";
import { reportApi, foodRequirementApi, settingsApi } from "../../services/api";
import { ReportsData, FoodRequirementData, SystemSettings } from "../../types";
import { StatCard } from "../../components/StatCard";
import {
  Users,
  Utensils,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Clock,
  Sparkles,
  ChefHat,
  Calendar,
} from "lucide-react";

interface AdminDashboardProps {
  onNavigate: (tab: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [requirements, setRequirements] = useState<FoodRequirementData | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rep, req, set] = await Promise.all([
          reportApi.getReports(),
          foodRequirementApi.get(),
          settingsApi.get(),
        ]);
        setReports(rep);
        setRequirements(req);
        setSettings(set);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !reports || !requirements) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        Loading PG Mess operations overview...
      </div>
    );
  }

  const s = reports.summary;

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              PG Mess Management & Waste Reduction
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live Operations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time head-count demand forecasting and kitchen food preparation metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate("admin-residents")}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Residents</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("admin-requirements")}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-emerald-200 transition-colors flex items-center gap-1.5"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Expected Kitchen Meals</span>
          </button>
        </div>
      </div>

      {/* 5 Core Metric Cards (Section 22 #8 Requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          id="stat-total-residents"
          title="Total Residents"
          value={s.totalResidents}
          subtitle={`${s.occupancyRate}% PG Occupancy`}
          icon={<Users className="w-5 h-5" />}
          color="indigo"
        />

        <StatCard
          id="stat-confirmed-meals"
          title="Today's Confirmed"
          value={s.todayConfirmedTotal}
          subtitle="Yes head-counts across 3 meals"
          icon={<Utensils className="w-5 h-5" />}
          color="emerald"
        />

        <StatCard
          id="stat-meals-served"
          title="Meals Served"
          value={s.mealsServed}
          subtitle="Logged attendance count"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="blue"
        />

        <StatCard
          id="stat-today-waste"
          title="Food Waste Avg"
          value={`${s.averageWastePct}%`}
          subtitle={`${s.totalWaste} plates wasted overall`}
          icon={<Trash2 className="w-5 h-5" />}
          color="rose"
        />

        <StatCard
          id="stat-low-stock"
          title="Low Stock Items"
          value={s.lowStockItems}
          subtitle="Requires purchase reorder"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Today's Meal Preparation Live Demand (Kitchen Sync) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Today's Live Meal Requirements (Head-Count Accuracy)
            </h2>
            <p className="text-xs text-slate-500">
              Direct count of residents who selected <strong>YES</strong> vs total registered ({requirements.totalResidents})
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("admin-requirements")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Detailed Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {/* Breakfast */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Breakfast
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {settings?.breakfastTime}
              </span>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">
                {requirements.breakfast.confirmedYes}{" "}
                <span className="text-xs font-medium text-slate-500">meals needed</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">
                Recommended Preparation: {requirements.breakfast.recommendedPreparation} plates
              </p>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 flex items-center justify-between">
              <span>Skipping: {requirements.breakfast.confirmedNo}</span>
              <span>Pending: {requirements.breakfast.pending}</span>
            </div>
          </div>

          {/* Lunch */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Lunch
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {settings?.lunchTime}
              </span>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">
                {requirements.lunch.confirmedYes}{" "}
                <span className="text-xs font-medium text-slate-500">meals needed</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">
                Recommended Preparation: {requirements.lunch.recommendedPreparation} plates
              </p>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 flex items-center justify-between">
              <span>Skipping: {requirements.lunch.confirmedNo}</span>
              <span>Pending: {requirements.lunch.pending}</span>
            </div>
          </div>

          {/* Dinner */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Dinner
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {settings?.dinnerTime}
              </span>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900">
                {requirements.dinner.confirmedYes}{" "}
                <span className="text-xs font-medium text-slate-500">meals needed</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">
                Recommended Preparation: {requirements.dinner.recommendedPreparation} plates
              </p>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 flex items-center justify-between">
              <span>Skipping: {requirements.dinner.confirmedNo}</span>
              <span>Pending: {requirements.dinner.pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Waste Reduction Impact & Quick Navigation Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Food Waste Reduction Tracking
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("admin-reports")}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Full Analytics
            </button>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <p>
              By knowing beforehand how many residents will dine, SmartMeal has kept
              our mess food waste under <strong>5%</strong> (compared to the typical 25-35%
              waste in non-booked hostels).
            </p>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span>Recent Waste Percentage:</span>
                <span>{s.averageWastePct}%</span>
              </div>
              <div className="w-full bg-emerald-200/60 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, s.averageWastePct * 5)}%` }}
                />
              </div>
              <p className="text-[11px] text-emerald-800">
                Formula: Waste % = (Wasted Plates / Prepared Plates) × 100
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Booking Deadline Controls
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Residents can only modify their booking before the configured cut-off hour.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="font-semibold text-slate-700">Breakfast Cutoff:</span>
                <span className="font-bold text-slate-900">{settings?.breakfastDeadline}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="font-semibold text-slate-700">Lunch Cutoff:</span>
                <span className="font-bold text-slate-900">{settings?.lunchDeadline}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="font-semibold text-slate-700">Dinner Cutoff:</span>
                <span className="font-bold text-slate-900">{settings?.dinnerDeadline}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={() => onNavigate("admin-settings")}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors text-center"
            >
              Configure Meal Times & Cut-Offs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
