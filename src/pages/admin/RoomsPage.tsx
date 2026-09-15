import React, { useState, useEffect } from "react";
import { roomApi } from "../../services/api";
import { Room } from "../../types";
import { Modal } from "../../components/Modal";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle,
  AlertTriangle,
  Layers,
} from "lucide-react";

interface RoomsPageProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({ onShowToast }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: "",
    floor: 1,
    capacity: 2,
  });
  const [saving, setSaving] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await roomApi.getAll();
      setRooms(data);
    } catch (err) {
      console.error(err);
      onShowToast("Failed to fetch rooms", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await roomApi.create(formData);
      onShowToast(`Room ${formData.roomNumber} created successfully`, "success");
      setIsAddModalOpen(false);
      setFormData({ roomNumber: "", floor: 1, capacity: 2 });
      fetchRooms();
    } catch (err: any) {
      onShowToast(err.response?.data?.message || "Failed to create room", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (id: string, roomNumber: string) => {
    if (!confirm(`Delete Room ${roomNumber}?`)) return;
    try {
      await roomApi.delete(id);
      onShowToast(`Room ${roomNumber} deleted`, "info");
      fetchRooms();
    } catch (err: any) {
      onShowToast(err.response?.data?.message || "Failed to delete room", "error");
    }
  };

  const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const totalOccupied = rooms.reduce((acc, r) => acc + r.occupied, 0);
  const availableSlots = Math.max(0, totalCapacity - totalOccupied);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Room & Occupancy Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure PG rooms, floor levels, bed capacities, and real-time occupancy.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Bed Capacity
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {totalCapacity} beds
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Currently Occupied
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {totalOccupied} residents
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Available Vacancies
            </div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {availableSlots} beds free
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-4 text-center py-10 text-xs text-slate-400">
            Loading rooms...
          </div>
        ) : (
          rooms.map((room) => {
            const isFull = room.occupied >= room.capacity;
            const occupancyPct = Math.round((room.occupied / room.capacity) * 100);

            return (
              <div
                key={room.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                        {room.roomNumber}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          Room {room.roomNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">Floor {room.floor}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isFull
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {isFull ? "Full" : "Available"}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Occupancy:</span>
                      <span className="font-bold text-slate-800">
                        {room.occupied} / {room.capacity} beds
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          isFull ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {room.capacity - room.occupied} slot(s) open
                  </span>
                  <button
                    type="button"
                    disabled={room.occupied > 0}
                    onClick={() => handleDeleteRoom(room.id, room.roomNumber)}
                    className="p-1 text-slate-300 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-300"
                    title={room.occupied > 0 ? "Cannot delete occupied room" : "Delete room"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add Room */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add PG Room"
        subtitle="Create a new room and specify its floor and maximum bed capacity."
      >
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Room Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 204 or 305"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Floor *
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bed Capacity *
              </label>
              <input
                type="number"
                min={1}
                max={6}
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
            >
              {saving ? "Saving..." : "Create Room"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
