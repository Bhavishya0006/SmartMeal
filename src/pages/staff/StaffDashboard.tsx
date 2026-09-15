import React, { useState, useEffect } from "react";
import { foodRequirementApi, inventoryApi, settingsApi } from "../../services/api";
import { FoodRequirementData, InventoryItem, SystemSettings } from "../../types";
import {
  ChefHat,
  Utensils,
  Package,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
  Users,
} from "lucide-react";

interface StaffDashboardProps {
  onNavigate: (tab: any) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ onNavigate }) => {
  const [requirements, setRequirements] = useState<FoodRequirementData | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [req, inv, set] = await Promise.all([
          foodRequirementApi.get(),
          inventoryApi.getAll(),
          settingsApi.get(),
        ]);
        setRequirements(req);
        setInventory(inv);
        setSettings(set);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !requirements) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        Loading kitchen operations console...
      </div>
    );
  }

  const lowStock = inventory.filter((i) => i.status !== "GOOD");

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-amber-900 rounded-3xl p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600/60 border border-amber-400/30 text-xs font-semibold">
            <ChefHat className="w-3.5 h-3.5 text-amber-200" />
            <span>Kitchen & Mess Staff Console</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Kitchen Preparation & Waste Control
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
            Prepare only what residents have confirmed to avoid surplus waste. Monitor live attendee counts and log serving results after each meal.
          </p>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onNavigate("staff-attendance")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Serving Counter Check-in</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("staff-waste")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-900/60 hover:bg-amber-900/80 text-white rounded-xl text-xs sm:text-sm font-bold border border-amber-400/40 transition-all"
            >
              <Trash2 className="w-4 h-4 text-rose-300" />
              <span>Log Post-Meal Leftovers</span>
            </button>
          </div>
        </div>

        <ChefHat className="absolute -right-8 -bottom-10 w-64 h-64 text-white/5 pointer-events-none" />
      </div>

      {/* Target Preparation Cards for Kitchen */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Target Meal Quantities to Cook Today
            </h2>
            <p className="text-xs text-slate-500">
              Calculated automatically from resident Yes/No confirmations (+{requirements.bufferPercentage}% buffer)
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("staff-attendance")}
            className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
          >
            <span>Live Counter List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Breakfast */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Breakfast
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {settings?.breakfastTime}
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900">
                {requirements.breakfast.recommendedPreparation}{" "}
                <span className="text-xs font-bold text-emerald-600">plates to cook</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Confirmed Attendees: <strong>{requirements.breakfast.confirmedYes}</strong>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Skipping: {requirements.breakfast.confirmedNo}</span>
              <span className="font-semibold text-amber-600">
                Buffer: +{requirements.breakfast.bufferPlates}
              </span>
            </div>
          </div>

          {/* Lunch */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Lunch
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {settings?.lunchTime}
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900">
                {requirements.lunch.recommendedPreparation}{" "}
                <span className="text-xs font-bold text-emerald-600">plates to cook</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Confirmed Attendees: <strong>{requirements.lunch.confirmedYes}</strong>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Skipping: {requirements.lunch.confirmedNo}</span>
              <span className="font-semibold text-amber-600">
                Buffer: +{requirements.lunch.bufferPlates}
              </span>
            </div>
          </div>

          {/* Dinner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Dinner
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {settings?.dinnerTime}
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900">
                {requirements.dinner.recommendedPreparation}{" "}
                <span className="text-xs font-bold text-emerald-600">plates to cook</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Confirmed Attendees: <strong>{requirements.dinner.confirmedYes}</strong>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Skipping: {requirements.dinner.confirmedNo}</span>
              <span className="font-semibold text-amber-600">
                Buffer: +{requirements.dinner.bufferPlates}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory & Grocery Stock Status for Kitchen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">
                Grocery Stock & Restock Alerts
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("staff-inventory")}
              className="text-xs font-bold text-amber-700 hover:underline"
            >
              All Inventory ({inventory.length})
            </button>
          </div>

          {lowStock.length === 0 ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All groceries have sufficient stock above minimum levels!</span>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStock.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="text-[11px] text-amber-800 ml-2">
                      (Current: {item.quantity} {item.unit}, Min: {item.minStockLevel} {item.unit})
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase">
                    Low Stock
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Waste Logging CTA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              End-of-Meal Food Waste Auditing
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              After breakfast, lunch, or dinner completes, log the actual number of plates served and any leftovers discarded to maintain the PG waste audit trail.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate("staff-waste")}
              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors text-center"
            >
              Open Waste Logging Module
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
