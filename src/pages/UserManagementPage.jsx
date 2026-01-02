import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FaUserPlus,
  FaUserShield,
  FaSyncAlt,
  FaEnvelope,
  FaUserTag,
  FaEdit,
  FaTrashAlt,
  FaUniversity,
  FaTerminal,
} from "react-icons/fa";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import SelectDropdown from "../components/ui/SelectDropdown";
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  getBranches,
} from "../api/apiService";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "teacher",
    campus: "",
  });

  const roleOptions = [
    { _id: "admin", name: "Administrator" },
    { _id: "teacher", name: "Global Teacher" },
    { _id: "incharge", name: "Campus Incharge" },
  ];

  const fetchUsersAndBranches = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, branchRes] = await Promise.all([
        getUsers(),
        getBranches(),
      ]);
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
      setBranches(Array.isArray(branchRes.data) ? branchRes.data : []);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Access Revoked: Administrative privileges required.");
      } else {
        toast.error("Buffer Sync Error: Failed to fetch records.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsersAndBranches();
  }, [fetchUsersAndBranches]);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "teacher",
      campus: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name || "",
      email: u.email || "",
      password: "",
      role: u.role || "teacher",
      campus: u.campus?._id || u.campus || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email)
      return toast.error("Identity data incomplete.");
    if (formData.role === "incharge" && !formData.campus)
      return toast.error("Campus assignment required for Incharge.");

    try {
      if (editingUser) {
        await updateUser(editingUser._id, formData);
        toast.success("User Node re-indexed successfully.");
      } else {
        if (!formData.password) return toast.error("Security key missing.");
        await addUser(formData);
        toast.success("New access node established.");
      }
      setIsModalOpen(false);
      fetchUsersAndBranches();
    } catch (error) {
      toast.error(error.response?.data?.message || "Protocol failure.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Authorize permanent removal of this access node?")) {
      try {
        await deleteUser(id);
        toast.success("Node terminated.");
        fetchUsersAndBranches();
      } catch (error) {
        toast.error("Operation aborted.");
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen pt-10">
      {/* --- HEADER --- */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-sm border border-white mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-indigo-100/50">
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
            <FaUserShield size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">
              User Registry
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
              <FaTerminal className="text-indigo-500" /> SYSTEM ACCESS
              GOVERNANCE
            </p>
          </div>
        </div>
        <Button
          onClick={openAddModal}
          variant="primary"
          className="rounded-2xl px-10 py-5 bg-indigo-600 shadow-xl shadow-indigo-100 uppercase font-black text-[11px] tracking-widest flex items-center gap-3"
        >
          <FaUserPlus size={14} /> Initialize New Node
        </Button>
      </div>
      {/* --- USER MATRIX TABLE --- */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-4 shadow-sm border border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                  Identity Nodes
                </th>
                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                  Privilege Level
                </th>
                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                  Assigned Campus
                </th>
                <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                  Operations
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-32 text-center animate-pulse uppercase font-black text-slate-300 tracking-[0.5em]"
                  >
                    Synchronizing Matrix...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u._id}
                    className="group hover:bg-indigo-50/30 transition-all"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs uppercase tracking-tighter shadow-lg group-hover:rotate-6 transition-transform">
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm uppercase tracking-tight">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold flex items-center mt-0.5">
                            <FaEnvelope className="mr-1 text-[8px]" /> {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                          u.role === "admin"
                            ? "bg-rose-50 border-rose-100 text-rose-600"
                            : u.role === "incharge"
                            ? "bg-indigo-50 border-indigo-100 text-indigo-600"
                            : "bg-slate-50 border-slate-200 text-slate-500"
                        }`}
                      >
                        <FaUserTag className="mr-1.5" /> {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {u.role === "incharge" ? (
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                          <FaUniversity className="text-indigo-400" />{" "}
                          {u.campus?.name || "Unassigned"}
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-300 uppercase italic tracking-tighter">
                          Global Accessibility
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => openEditModal(u)}
                          className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="h-8 w-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* --- DYNAMIC ADD/EDIT MODAL --- */}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Modify User Access" : "Register New Access"}
      >
        <div className="space-y-6 p-2">
          {/* নাম এবং ইমেইল ফিল্ড (আগের মতোই থাকবে) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Full Identity
              </label>
              <input
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 font-bold text-sm outline-none transition-all"
                value={formData.name}
                placeholder="Name"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Network Email
              </label>
              <input
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 font-bold text-sm outline-none transition-all"
                value={formData.email}
                placeholder="Email"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* পাসওয়ার্ড এবং রোল ফিল্ড */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">
                {editingUser ? "New Security Key (Optional)" : "Security Key"}
              </label>
              <input
                className="w-full p-4 bg-slate-50 border border-indigo-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 font-bold text-sm outline-none transition-all"
                type="password"
                placeholder={
                  editingUser ? "Leave blank to keep old password" : "••••••••"
                }
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              {editingUser && (
                <p className="text-[8px] text-slate-400 ml-1 font-bold italic">
                  * Blank input retains current matrix key
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Privilege Role
              </label>
              <SelectDropdown
                options={roleOptions}
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              />
            </div>
          </div>

          {/* ক্যাম্পাস ড্রপডাউন (ইনচার্জের জন্য) */}
          {formData.role === "incharge" && (
            <div className="space-y-1 animate-in slide-in-from-top-2">
              <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1">
                Campus Node Selection
              </label>
              <SelectDropdown
                options={branches}
                value={formData.campus}
                onChange={(e) =>
                  setFormData({ ...formData, campus: e.target.value })
                }
                placeholder="Link to Branch"
              />
            </div>
          )}

          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              fullWidth
              variant="primary"
              className="py-5 rounded-2xl font-black text-[11px] tracking-widest uppercase bg-slate-900 shadow-2xl hover:bg-indigo-600 transition-all"
            >
              {editingUser ? "Push Updates to Matrix" : "Establish Node Access"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
