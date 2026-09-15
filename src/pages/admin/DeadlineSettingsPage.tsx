import React, { useState, useEffect } from "react";
import { settingsApi } from "../../services/api";
import { SystemSettings } from "../../types";
import {
  Clock,
  Save,
  Sun,
  CloudSun,
  Moon,
  ShieldCheck,
  Percent,
  Sliders,
  Sparkles,
} from "lucide-react";

interface DeadlineSettingsPageProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const DeadlineSettingsPage: React.FC<DeadlineSettingsPageProps> = ({ onShowToast }) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await settingsApi.get();
        setSettings(data);
      } catch (err) {
        console.error(err);
        onShowToast("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await settingsApi.update(settings);
      setSettings(updated);
      onShowToast("System settings & deadlines saved successfully!", "success");
    } catch (err) {
      onShowToast("Failed to update settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-12 text-center text-slate-400 text-xs">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Meal Deadlines & System Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure meal booking cut-off times, serving windows, and kitchen preparation buffers.
          </p>
        </div>

        <button
          type="submit"
          form="settings-form"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Settings..." : "Save All Changes"}</span>
        </button>
      </div>

      <form id="settings-form" onSubmit={handleSave} className="space-y-6">
        {/* Deadline Enforcement Switch */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Enforce Strict Booking Deadlines
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              When enabled, residents cannot confirm or change meals after the deadline has passed.
              (Keep enabled for production; disable if you want to test booking at any hour).
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enforceDeadlines}
              onChange={(e) =>
                setSettings({ ...settings, enforceDeadlines: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Meal Timings & Deadlines Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Breakfast */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 bg-amber-50 rounded-xl">
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Breakfast</h3>
                <span className="text-[11px] text-slate-400">Morning service</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Booking Cut-off Time (HH:MM 24hr)
              </label>
              <input
                type="time"
                value={settings.breakfastDeadline}
                onChange={(e) =>
                  setSettings({ ...settings, breakfastDeadline: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Default: 07:30 AM
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mess Serving Window
              </label>
              <input
                type="text"
                value={settings.breakfastTime}
                onChange={(e) =>
                  setSettings({ ...settings, breakfastTime: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Lunch */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 bg-orange-50 rounded-xl">
                <CloudSun className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lunch</h3>
                <span className="text-[11px] text-slate-400">Afternoon service</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Booking Cut-off Time (HH:MM 24hr)
              </label>
              <input
                type="time"
                value={settings.lunchDeadline}
                onChange={(e) =>
                  setSettings({ ...settings, lunchDeadline: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Default: 11:30 AM
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mess Serving Window
              </label>
              <input
                type="text"
                value={settings.lunchTime}
                onChange={(e) =>
                  setSettings({ ...settings, lunchTime: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Dinner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <Moon className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dinner</h3>
                <span className="text-[11px] text-slate-400">Evening service</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Booking Cut-off Time (HH:MM 24hr)
              </label>
              <input
                type="time"
                value={settings.dinnerDeadline}
                onChange={(e) =>
                  setSettings({ ...settings, dinnerDeadline: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Default: 05:30 PM (17:30)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mess Serving Window
              </label>
              <input
                type="text"
                value={settings.dinnerTime}
                onChange={(e) =>
                  setSettings({ ...settings, dinnerTime: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Section 18 Kitchen Preparation Buffer Setting */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Kitchen Preparation Buffer Percentage
              </h2>
              <p className="text-xs text-slate-500">
                Safety margin added to confirmed "Yes" head-counts for unexpected warden visits or second servings (e.g. 5% on 70 meals = +4 plates).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <input
              type="range"
              min={0}
              max={15}
              step={1}
              value={settings.bufferPercentage}
              onChange={(e) =>
                setSettings({ ...settings, bufferPercentage: Number(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="w-16 text-center font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-200 py-1.5 px-2 rounded-xl text-xs">
              {settings.bufferPercentage}%
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};
