import React, { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import {
  FaBuilding,
  FaEdit,
  FaEnvelope,
  FaFilter,
  FaLock,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaSyncAlt,
  FaTimes,
  FaTrashAlt,
  FaUserCheck,
  FaUserCog,
  FaUserShield,
  FaUserTie,
  FaUsers,
} from "react-icons/fa";
import SelectDropdown from "../components/ui/SelectDropdown";
import {
  addUser,
  deleteUser,
  getBranches,
  getUsers,
  updateUser,
} from "../api/apiService";

const roleOptions = [
  { _id: "admin", name: "Admin" },
  { _id: "teacher", name: "Teacher" },
  { _id: "incharge", name: "Incharge" },
];

const roleMeta = {
  admin: {
    label: "Admin",
    icon: FaUserShield,
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    avatar: "bg-rose-600 text-white",
  },
  incharge: {
    label: "Incharge",
    icon: FaUserCheck,
    badge: "border-teal-200 bg-teal-50 text-teal-800",
    avatar: "bg-teal-700 text-white",
  },
  teacher: {
    label: "Teacher",
    icon: FaUserTie,
    badge: "border-slate-200 bg-slate-50 text-slate-700",
    avatar: "bg-slate-900 text-white",
  },
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "teacher",
  campus: "",
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const getCampusName = (user) => {
  if (user.role !== "incharge") return "Global access";
  return user.campus?.name || "Unassigned";
};

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
      </div>
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-slate-700">
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const RoleBadge = ({ role }) => {
  const meta = roleMeta[role] || roleMeta.teacher;
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${meta.badge}`}
    >
      <Icon size={12} />
      {meta.label}
    </span>
  );
};

const UserAvatar = ({ user }) => {
  const meta = roleMeta[user.role] || roleMeta.teacher;

  return (
    <div
      className={`grid h-11 w-11 flex-none place-items-center rounded-lg text-sm font-semibold ${meta.avatar}`}
    >
      {getInitials(user.name)}
    </div>
  );
};

const UserFormModal = ({
  isOpen,
  editingUser,
  formData,
  branches,
  saving,
  onClose,
  onSubmit,
  onChange,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/45 backdrop-blur-sm"
        onClick={saving ? undefined : onClose}
        aria-label="Close user form"
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="h-1.5 bg-slate-900" />
        <div className="p-6 sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 flex-none place-items-center rounded-lg bg-slate-100 text-slate-800">
                {editingUser ? <FaUserCog size={20} /> : <FaPlus size={18} />}
              </div>
              <div>
                <p className="text-xs font-semibold text-teal-700">
                  Access control
                </p>
                <h2
                  id="user-form-title"
                  className="mt-1 text-xl font-semibold text-slate-950"
                >
                  {editingUser ? "Edit user access" : "Add new user"}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close modal"
            >
              <FaTimes size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Full name
              </span>
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                value={formData.name}
                placeholder="Name"
                onChange={(event) => onChange("name", event.target.value)}
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Email
              </span>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                value={formData.email}
                placeholder="name@example.com"
                onChange={(event) => onChange("email", event.target.value)}
              />
            </label>

            <label className="space-y-1.5">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <FaLock size={12} className="text-slate-400" />
                {editingUser ? "New password" : "Password"}
              </span>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                value={formData.password}
                placeholder={editingUser ? "Leave blank to keep current" : "Password"}
                onChange={(event) => onChange("password", event.target.value)}
              />
            </label>

            <SelectDropdown
              label="Role"
              options={roleOptions}
              value={formData.role}
              onChange={(event) => onChange("role", event.target.value)}
            />
          </div>

          {formData.role === "incharge" && (
            <div className="mt-4">
              <SelectDropdown
                label="Assigned campus"
                options={branches}
                value={formData.campus}
                onChange={(event) => onChange("campus", event.target.value)}
                placeholder="Select campus"
              />
            </div>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <FaSyncAlt className="animate-spin" />
                  Saving...
                </>
              ) : editingUser ? (
                "Update user"
              ) : (
                "Add user"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteUserModal = ({
  user,
  deleting,
  onClose,
  onConfirm,
}) => {
  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-user-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/45 backdrop-blur-sm"
        onClick={deleting ? undefined : onClose}
        aria-label="Close delete confirmation"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-rose-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="h-1.5 bg-rose-600" />
        <div className="p-6 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 flex-none place-items-center rounded-lg bg-rose-50 text-rose-600">
                <FaTrashAlt size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-rose-600">
                  Permanent removal
                </p>
                <h2
                  id="delete-user-title"
                  className="mt-1 text-xl font-semibold text-slate-950"
                >
                  Delete this user?
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close modal"
            >
              <FaTimes size={14} />
            </button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">{user.name}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {user.email}
            </p>
          </div>

          <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
            This removes the account from system access. This action cannot be
            undone from this page.
          </p>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keep user
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <FaSyncAlt className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrashAlt size={13} />
                  Delete user
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [formData, setFormData] = useState(emptyForm);

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
      toast.error(
        error.response?.status === 403
          ? "Administrative privileges required."
          : "Failed to fetch users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsersAndBranches();
  }, [fetchUsersAndBranches]);

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((user) => user.role === "admin").length,
      incharges: users.filter((user) => user.role === "incharge").length,
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesSearch =
        !query ||
        [user.name, user.email, user.role, user.campus?.name]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));

      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchQuery]);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "teacher",
      campus: user.campus?._id || user.campus || "",
    });
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    if (saving) return;
    setIsModalOpen(false);
  };

  const updateFormField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "role" && value !== "incharge" ? { campus: "" } : {}),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }

    if (formData.role === "incharge" && !formData.campus) {
      toast.error("Campus is required for incharge users.");
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error("Password is required for new users.");
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        await updateUser(editingUser._id, formData);
        toast.success("User updated.");
      } else {
        await addUser(formData);
        toast.success("User added.");
      }
      setIsModalOpen(false);
      fetchUsersAndBranches();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteUser(deleteTarget._id);
      toast.success("User removed.");
      setDeleteTarget(null);
      fetchUsersAndBranches();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-10 pt-5 text-slate-900 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-[1440px] space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                <FaShieldAlt size={12} />
                Admin access control
              </div>
              <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
                Users
              </h1>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
                Manage staff access, administrator privileges, and campus-level
                incharge assignments.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={fetchUsersAndBranches}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaSyncAlt className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                <FaPlus size={13} />
                Add User
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard icon={FaUsers} label="Total Users" value={stats.total} />
          <StatCard icon={FaUserShield} label="Admins" value={stats.admins} />
          <StatCard
            icon={FaUserCheck}
            label="Incharges"
            value={stats.incharges}
          />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Access registry
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {filteredUsers.length} of {users.length} users visible
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(240px,1fr)_180px] lg:w-[560px]">
              <label className="space-y-1.5">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FaSearch size={12} className="text-slate-400" />
                  Search
                </span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Name, email, role, campus"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <label className="space-y-1.5">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FaFilter size={12} className="text-slate-400" />
                  Role
                </span>
                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  className="h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition-colors focus:border-slate-700 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="all">All roles</option>
                  <option value="admin">Admin</option>
                  <option value="incharge">Incharge</option>
                  <option value="teacher">Teacher</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-600">
                    User
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-600">
                    Role
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-600">
                    Campus
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <FaSyncAlt className="mx-auto animate-spin text-3xl text-teal-600/40" />
                      <p className="mt-4 text-sm font-semibold text-slate-500">
                        Loading users...
                      </p>
                    </td>
                  </tr>
                ) : filteredUsers.length ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-950">
                              {user.name}
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                              <FaEnvelope size={11} />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <FaBuilding className="text-slate-400" />
                          {getCampusName(user)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
                            aria-label={`Edit ${user.name}`}
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(user)}
                            className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-600 hover:text-white"
                            aria-label={`Delete ${user.name}`}
                          >
                            <FaTrashAlt size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <p className="text-sm font-semibold text-slate-600">
                        No users match your filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 lg:hidden">
            {loading ? (
              <div className="py-20 text-center">
                <FaSyncAlt className="mx-auto animate-spin text-3xl text-teal-600/40" />
                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Loading users...
                </p>
              </div>
            ) : filteredUsers.length ? (
              filteredUsers.map((user) => (
                <div key={user._id} className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar user={user} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {user.name}
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-none gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(user)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600"
                        aria-label={`Edit ${user.name}`}
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(user)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600"
                        aria-label={`Delete ${user.name}`}
                      >
                        <FaTrashAlt size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <RoleBadge role={user.role} />
                    <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                      <FaBuilding size={11} />
                      {getCampusName(user)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  No users match your filters.
                </p>
              </div>
            )}
          </div>
        </section>

        <UserFormModal
          isOpen={isModalOpen}
          editingUser={editingUser}
          formData={formData}
          branches={branches}
          saving={saving}
          onClose={closeFormModal}
          onSubmit={handleSubmit}
          onChange={updateFormField}
        />

        <DeleteUserModal
          user={deleteTarget}
          deleting={deleting}
          onClose={() => !deleting && setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      </main>
    </div>
  );
};

export default UserManagementPage;
