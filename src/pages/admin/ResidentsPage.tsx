import React, { useState, useEffect } from "react";
import { residentApi, roomApi } from "../../services/api";
import { Resident, Room } from "../../types";
import { Modal } from "../../components/Modal";
import {
  Users,
  UserPlus,
  Search,
  Building2,
  Phone,
  Mail,
  Edit2,
  Trash2,
  KeyRound,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Lock,
} from "lucide-react";

interface ResidentsPageProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const ResidentsPage: React.FC<ResidentsPageProps> = ({ onShowToast }) => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoomFilter, setSelectedRoomFilter] = useState("ALL");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [activeResident, setActiveResident] = useState<Resident | null>(null);

  // Form States for Add Resident
  const [formData, setFormData] = useState({
    residentId: "",
    name: "",
    email: "",
    phone: "",
    roomNumber: "",
    temporaryPassword: "",
  });

  // Form State for Reset Password
  const [newTempPassword, setNewTempPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resData, roomData] = await Promise.all([
        residentApi.getAll(),
        roomApi.getAll(),
      ]);
      setResidents(resData);
      setRooms(roomData);
    } catch (err) {
      console.error("Failed to load residents:", err);
      onShowToast("Failed to load residents", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    // Generate an automatic next Resident ID suggestion
    const nextNum = 100 + residents.length + 1;
    setFormData({
      residentId: `RES-${nextNum}`,
      name: "",
      email: "",
      phone: "",
      roomNumber: rooms.find((r) => r.status === "AVAILABLE")?.roomNumber || "101",
      temporaryPassword: "pg" + Math.floor(1000 + Math.random() * 9000),
    });
    setIsAddModalOpen(true);
  };

  const handleCreateResident = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await residentApi.create(formData);
      onShowToast(`Account created for ${formData.name}! Temporary password: ${formData.temporaryPassword}`, "success");
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      onShowToast(err.response?.data?.message || "Failed to create resident account", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (res: Resident) => {
    setActiveResident(res);
    setFormData({
      residentId: res.residentId,
      name: res.name,
      email: res.email,
      phone: res.phone,
      roomNumber: res.roomNumber,
      temporaryPassword: "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResident) return;
    setSaving(true);
    try {
      await residentApi.update(activeResident.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        roomNumber: formData.roomNumber,
      });
      onShowToast("Resident details updated successfully", "success");
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      onShowToast(err.response?.data?.message || "Failed to update resident", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenResetPassword = (res: Resident) => {
    setActiveResident(res);
    setNewTempPassword("pg" + Math.floor(1000 + Math.random() * 9000));
    setIsResetPassModalOpen(true);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResident) return;
    setSaving(true);
    try {
      await residentApi.update(activeResident.id, {
        resetPassword: newTempPassword,
      });
      onShowToast(`Password reset for ${activeResident.name} to: ${newTempPassword}`, "success");
      setIsResetPassModalOpen(false);
      fetchData();
    } catch (err: any) {
      onShowToast("Failed to reset password", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove resident ${name}? This will also remove room assignment.`)) return;
    try {
      await residentApi.delete(id);
      onShowToast(`Resident ${name} removed`, "info");
      fetchData();
    } catch (err: any) {
      onShowToast("Failed to delete resident", "error");
    }
  };

  const filtered = residents.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.residentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoom = selectedRoomFilter === "ALL" || r.roomNumber === selectedRoomFilter;
    return matchesSearch && matchesRoom;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Strict Policy Notification */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Resident Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              Admin Provisioned Only
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Strict policy enforced: No public registration. Only Admin can create resident accounts, assign rooms, and issue temporary passwords.
          </p>
        </div>

        <button
          type="button"
          id="btn-add-resident"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Resident</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, ID, room, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium">Filter by Room:</span>
          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Rooms</option>
            {rooms.map((rm) => (
              <option key={rm.id} value={rm.roomNumber}>
                Room {rm.roomNumber} ({rm.occupied}/{rm.capacity})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading residents...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No residents match your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Resident ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Room</th>
                  <th className="py-3.5 px-4">Password Status</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-indigo-700">
                      {res.residentId}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {res.name}
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{res.email}</span>
                      </div>
                      {res.phone && (
                        <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{res.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px]">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        Room {res.roomNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {res.hasChangedPassword ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          Personalized
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Lock className="w-3 h-3" />
                          Temp Password
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenResetPassword(res)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Reset Temporary Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(res)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Resident"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(res.id, res.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove Resident"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Resident (Section 3 Requirement) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New PG Resident"
        subtitle="Provision a verified student account with room assignment and temporary credentials."
      >
        <form onSubmit={handleCreateResident} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Resident / Student ID *
              </label>
              <input
                type="text"
                required
                value={formData.residentId}
                onChange={(e) => setFormData({ ...formData, residentId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="rahul@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Assign Room Number *
              </label>
              <select
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              >
                {rooms.map((rm) => (
                  <option
                    key={rm.id}
                    value={rm.roomNumber}
                    disabled={rm.occupied >= rm.capacity}
                  >
                    Room {rm.roomNumber} (Floor {rm.floor} • Occupied: {rm.occupied}/{rm.capacity}) {rm.occupied >= rm.capacity ? "- FULL" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Temporary Password *
              </label>
              <input
                type="text"
                required
                value={formData.temporaryPassword}
                onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Resident can change this password after logging into their profile.
              </span>
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all disabled:opacity-50"
            >
              {saving ? "Creating Account..." : "Create Resident Account"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Resident */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Resident Information"
      >
        <form onSubmit={handleUpdateResident} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Resident Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reassign Room
            </label>
            <select
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
            >
              {rooms.map((rm) => (
                <option key={rm.id} value={rm.roomNumber}>
                  Room {rm.roomNumber} (Floor {rm.floor} • {rm.occupied}/{rm.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Reset Temporary Password */}
      <Modal
        isOpen={isResetPassModalOpen}
        onClose={() => setIsResetPassModalOpen(false)}
        title={`Reset Password for ${activeResident?.name}`}
        subtitle={`Resident ID: ${activeResident?.residentId}`}
      >
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              New Temporary Password
            </label>
            <input
              type="text"
              required
              value={newTempPassword}
              onChange={(e) => setNewTempPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Share this temporary password with the resident. They can use it to log in and change their password in Profile.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsResetPassModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
            >
              {saving ? "Resetting..." : "Issue New Password"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
