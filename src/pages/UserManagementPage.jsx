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
} from "react-icons/fa";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import SelectDropdown from "../components/ui/SelectDropdown";
import { getUsers, addUser, updateUser, deleteUser } from "../api/apiService";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "teacher",
  });

  const roleOptions = [
    { _id: "admin", name: "Admin" },
    { _id: "teacher", name: "Teacher" },
    { _id: "incharge", name: "Incharge" },
  ];

  // Wrapped in useCallback to prevent unnecessary re-renders
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // Improved error messaging for 403 Forbidden
      if (error.response?.status === 403) {
        toast.error("Access Denied: You do not have administrator privileges.");
      } else {
        toast.error("Failed to load users from server.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "teacher" });
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name || "",
      email: u.email || "",
      password: "",
      role: u.role || "teacher",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and Email are required.");
      return;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser._id, formData);
        toast.success("User profile updated!");
      } else {
        if (!formData.password) {
          toast.error("Password is required for new users.");
          return;
        }
        await addUser(formData);
        toast.success("New user registered successfully!");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      const msg = error.response?.data?.message || "Operation failed.";
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to permanently remove this user?")
    ) {
      try {
        await deleteUser(id);
        toast.success("User removed from system.");
        fetchUsers();
      } catch (error) {
        toast.error("Delete operation failed.");
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      {/* --- HEADER SECTION --- */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-indigo-900 flex items-center tracking-tight">
            <FaUserShield className="mr-3 text-indigo-600" /> User Management
          </h2>
          <p className="text-gray-500 mt-1 font-medium">
            Control system access and user privileges
          </p>
        </div>
        <Button
          onClick={openAddModal}
          variant="primary"
          className="shadow-lg shadow-indigo-100 px-8 py-3"
        >
          <FaUserPlus className="mr-2" /> New User
        </Button>
      </div>

      {/* --- USER TABLE SECTION --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                User Details
              </th>
              <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                Role
              </th>
              <th className="px-8 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan="3" className="py-20 text-center">
                  <FaSyncAlt className="animate-spin text-4xl text-indigo-500 mx-auto" />
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((u) => (
                <tr
                  key={u._id}
                  className="hover:bg-indigo-50/30 transition-all duration-200"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-4 uppercase">
                        {/* 🛡️ Defensive fix for charAt error */}
                        {u.name ? u.name.charAt(0) : "U"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm uppercase">
                          {u.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center mt-0.5">
                          <FaEnvelope className="mr-1 text-[10px]" /> {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black bg-white border border-gray-200 text-indigo-600 uppercase tracking-widest shadow-sm">
                      <FaUserTag className="mr-1.5" /> {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove User"
                      >
                        <FaTrashAlt size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-20 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Modify User Access" : "Register New Access"}
      >
        <div className="space-y-5 p-2">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
              Full Identity
            </label>
            <input
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm"
              value={formData.name}
              placeholder="e.g. Arifur Rahman"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
              Email Address
            </label>
            <input
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm"
              value={formData.email}
              placeholder="email@campus.com"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          {!editingUser && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
                Security Key
              </label>
              <input
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm"
                type="password"
                placeholder="••••••••"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">
              System Privilege
            </label>
            <SelectDropdown
              options={roleOptions}
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            />
          </div>
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              fullWidth
              variant="primary"
              className="py-4 rounded-2xl font-black tracking-widest uppercase"
            >
              {editingUser ? "Save Changes" : "Confirm Registration"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
