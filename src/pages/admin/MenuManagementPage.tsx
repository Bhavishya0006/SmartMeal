import React, { useState, useEffect } from "react";
import { menuApi, settingsApi } from "../../services/api";
import { MenuItem, MealType } from "../../types";
import { Modal } from "../../components/Modal";
import {
  Utensils,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Sun,
  CloudSun,
  Moon,
  Sparkles,
} from "lucide-react";

interface MenuManagementPageProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const MenuManagementPage: React.FC<MenuManagementPageProps> = ({ onShowToast }) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: todayStr,
    mealType: "BREAKFAST" as MealType,
    itemsText: "",
    mealTime: "08:00 AM - 09:30 AM",
    bookingDeadline: "07:30",
  });
  const [saving, setSaving] = useState(false);

  const fetchMenu = async (date: string) => {
    setLoading(true);
    try {
      const data = await menuApi.getMenu(date);
      setMenus(data);
    } catch (err) {
      console.error(err);
      onShowToast("Failed to load daily menus", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu(selectedDate);
  }, [selectedDate]);

  const handleOpenAdd = (type?: MealType) => {
    setEditingId(null);
    setFormData({
      date: selectedDate,
      mealType: type || "BREAKFAST",
      itemsText: "",
      mealTime:
        type === "LUNCH"
          ? "01:00 PM - 02:30 PM"
          : type === "DINNER"
          ? "08:00 PM - 09:30 PM"
          : "08:00 AM - 09:30 AM",
      bookingDeadline:
        type === "LUNCH" ? "11:30" : type === "DINNER" ? "17:30" : "07:30",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (menu: MenuItem) => {
    setEditingId(menu.id);
    setFormData({
      date: menu.date,
      mealType: menu.mealType,
      itemsText: menu.items.join(", "),
      mealTime: menu.mealTime,
      bookingDeadline: menu.bookingDeadline,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const items = formData.itemsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingId) {
        await menuApi.updateMenu(editingId, {
          items,
          mealTime: formData.mealTime,
          bookingDeadline: formData.bookingDeadline,
        });
        onShowToast("Menu updated successfully", "success");
      } else {
        await menuApi.saveMenu({
          date: formData.date,
          mealType: formData.mealType,
          items,
          mealTime: formData.mealTime,
          bookingDeadline: formData.bookingDeadline,
        });
        onShowToast("Menu item added successfully", "success");
      }
      setIsModalOpen(false);
      fetchMenu(selectedDate);
    } catch (err: any) {
      onShowToast("Failed to save menu", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu entry?")) return;
    try {
      await menuApi.deleteMenu(id);
      onShowToast("Menu entry deleted", "info");
      fetchMenu(selectedDate);
    } catch (err) {
      onShowToast("Failed to delete menu", "error");
    }
  };

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const mealOrder: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Daily Menu Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dishes for Breakfast, Lunch, and Dinner with meal serving times and booking deadlines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Date Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedDate === todayStr
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Today
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
              Tomorrow
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu</span>
          </button>
        </div>
      </div>

      {/* Menus List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mealOrder.map((mType) => {
          const menu = menus.find((m) => m.mealType === mType);

          const icon =
            mType === "BREAKFAST" ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : mType === "LUNCH" ? (
              <CloudSun className="w-5 h-5 text-orange-500" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-500" />
            );

          return (
            <div
              key={mType}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      {icon}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{mType}</h2>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {menu ? menu.mealTime : "Not set"}
                      </span>
                    </div>
                  </div>

                  {menu && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(menu)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Menu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(menu.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Menu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Dishes & Food Items:
                  </div>
                  {menu && menu.items.length > 0 ? (
                    <ul className="space-y-1.5">
                      {menu.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      <p>No menu configured for {mType.toLowerCase()}.</p>
                      <button
                        type="button"
                        onClick={() => handleOpenAdd(mType)}
                        className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                      >
                        + Add dishes now
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {menu && (
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Booking Deadline:</span>
                  <span className="font-bold text-slate-800">{menu.bookingDeadline}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Add or Edit Menu */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Menu Items" : "Add Menu Items"}
        subtitle={`Date: ${formData.date}`}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meal Type</label>
              <select
                disabled={!!editingId}
                value={formData.mealType}
                onChange={(e) => setFormData({ ...formData, mealType: e.target.value as MealType })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold"
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
                Serving Time Window
              </label>
              <input
                type="text"
                placeholder="e.g. 08:00 AM - 09:30 AM"
                value={formData.mealTime}
                onChange={(e) => setFormData({ ...formData, mealTime: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Booking Cut-off Deadline
              </label>
              <input
                type="text"
                placeholder="e.g. 07:30 or 17:00"
                value={formData.bookingDeadline}
                onChange={(e) => setFormData({ ...formData, bookingDeadline: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Food Items / Dishes (comma separated) *
            </label>
            <textarea
              rows={4}
              required
              placeholder="e.g. Basmati Rice, Dal Tadka, Paneer Butter Masala, Fresh Roti, Salad"
              value={formData.itemsText}
              onChange={(e) => setFormData({ ...formData, itemsText: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Separate each dish with a comma. These will be formatted as neat bullet points for the residents.
            </p>
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
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
            >
              {saving ? "Saving..." : "Save Menu"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
