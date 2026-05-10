import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaBook,
  FaBuilding,
  FaCalendarAlt,
  FaChevronLeft,
  FaDatabase,
  FaEdit,
  FaGraduationCap,
  FaLayerGroup,
  FaListOl,
  FaMapMarkerAlt,
  FaPlus,
  FaSave,
  FaSearch,
  FaShieldAlt,
  FaSyncAlt,
  FaTag,
  FaTasks,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import Button from "../components/ui/Button";
import {
  addMasterData,
  deleteMasterData,
  getMasterDataList,
  updateMasterData,
} from "../api/apiService";

const categoryOptions = [
  "Examination",
  "Administrative",
  "Academic",
  "Co-curricular",
  "Other",
];

const subjectTypeOptions = [
  "Core",
  "Compulsory",
  "Optional",
  "Religious",
  "Group",
];

const setupConfig = {
  branch: {
    title: "Branch/Shift Setup",
    subtitle: "Manage campus and shift records",
    icon: FaBuilding,
    itemLabel: "Branch/Shift",
    addTitle: "Add Branch/Shift",
    editTitle: "Edit Branch/Shift",
    searchPlaceholder: "Search branch, shift, location",
    emptyMessage: "No branch records found.",
    fields: [
      {
        key: "name",
        label: "Branch/Shift Name",
        required: true,
        placeholder: "Banasree Day",
      },
      { key: "location", label: "Location", placeholder: "Banasree" },
      { key: "description", label: "Description", placeholder: "Optional note" },
    ],
    columns: [
      { key: "name", label: "Branch/Shift", strong: true },
      { key: "location", label: "Location" },
      { key: "description", label: "Description" },
      { key: "updated", label: "Updated" },
    ],
    searchKeys: ["name", "location", "description"],
    defaults: { name: "", location: "", description: "" },
    stats: [
      { label: "Active branches", icon: FaBuilding, value: (items) => items.length },
      {
        label: "Locations",
        icon: FaMapMarkerAlt,
        value: (items) =>
          new Set(items.map((item) => item.location?.trim()).filter(Boolean))
            .size,
      },
      { label: "Last updated", icon: FaDatabase, value: latestUpdate },
    ],
    toPayload: (form) => ({
      name: form.name.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
    }),
  },
  class: {
    title: "Class Setup",
    subtitle: "Define academic cohorts and display order",
    icon: FaLayerGroup,
    itemLabel: "Class",
    addTitle: "Add Class",
    editTitle: "Edit Class",
    searchPlaceholder: "Search class or stream",
    emptyMessage: "No class records found.",
    fields: [
      { key: "name", label: "Class Name", required: true, placeholder: "NINE" },
      {
        key: "level",
        label: "Level",
        type: "number",
        required: true,
        placeholder: "9",
      },
      {
        key: "stream",
        label: "Streams",
        placeholder: "Science, Commerce",
      },
    ],
    columns: [
      { key: "name", label: "Class", strong: true },
      { key: "level", label: "Level" },
      { key: "stream", label: "Streams" },
      { key: "updated", label: "Updated" },
    ],
    searchKeys: ["name", "stream"],
    defaults: { name: "", level: "", stream: "" },
    stats: [
      { label: "Class records", icon: FaGraduationCap, value: (items) => items.length },
      {
        label: "Highest level",
        icon: FaListOl,
        value: (items) =>
          items.length
            ? Math.max(...items.map((item) => Number(item.level) || 0))
            : 0,
      },
      { label: "Last updated", icon: FaDatabase, value: latestUpdate },
    ],
    toPayload: (form) => ({
      name: form.name.trim(),
      level: form.level,
      stream: form.stream
        ? form.stream
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    }),
  },
  subject: {
    title: "Subject Setup",
    subtitle: "Manage curriculum subjects and codes",
    icon: FaBook,
    itemLabel: "Subject",
    addTitle: "Add Subject",
    editTitle: "Edit Subject",
    searchPlaceholder: "Search subject, code, type",
    emptyMessage: "No subject records found.",
    fields: [
      { key: "name", label: "Subject Name", required: true, placeholder: "Physics" },
      { key: "code", label: "Code", placeholder: "PHY" },
      {
        key: "type",
        label: "Subject Type",
        type: "select",
        options: subjectTypeOptions,
      },
      {
        key: "minClassLevel",
        label: "Minimum Class Level",
        type: "number",
        placeholder: "9",
      },
    ],
    columns: [
      { key: "name", label: "Subject", strong: true },
      { key: "code", label: "Code" },
      { key: "type", label: "Type" },
      { key: "minClassLevel", label: "Min level" },
      { key: "updated", label: "Updated" },
    ],
    searchKeys: ["name", "code", "type"],
    defaults: { name: "", code: "", type: "Core", minClassLevel: "" },
    stats: [
      { label: "Subjects", icon: FaBook, value: (items) => items.length },
      {
        label: "With code",
        icon: FaTag,
        value: (items) => items.filter((item) => item.code).length,
      },
      { label: "Last updated", icon: FaDatabase, value: latestUpdate },
    ],
    toPayload: (form) => ({
      name: form.name.trim(),
      code: form.code.trim(),
      type: form.type,
      minClassLevel: form.minClassLevel,
    }),
  },
  responsibility: {
    title: "Duty Type Setup",
    subtitle: "Manage responsibilities, categories, and deadlines",
    icon: FaTasks,
    itemLabel: "Duty Type",
    addTitle: "Add Duty Type",
    editTitle: "Edit Duty Type",
    searchPlaceholder: "Search duty type, category, deadline",
    emptyMessage: "No duty type records found.",
    fields: [
      { key: "name", label: "Duty Type Name", required: true, placeholder: "Q-HY" },
      {
        key: "category",
        label: "Category",
        type: "select",
        required: true,
        options: categoryOptions,
      },
      {
        key: "submissionDeadline",
        label: "Last Submission Date",
        type: "date",
      },
      {
        key: "requiresClassSubject",
        label: "Requires class and subject",
        type: "checkbox",
      },
      { key: "description", label: "Description", placeholder: "Optional note" },
    ],
    columns: [
      { key: "name", label: "Duty Type", strong: true },
      { key: "category", label: "Category" },
      { key: "submissionDeadline", label: "Submission deadline" },
      { key: "requiresClassSubject", label: "Class/Subject" },
      { key: "updated", label: "Updated" },
    ],
    searchKeys: ["name", "category", "description", "submissionDeadline"],
    defaults: {
      name: "",
      category: "Examination",
      submissionDeadline: "",
      requiresClassSubject: true,
      description: "",
    },
    stats: [
      { label: "Duty types", icon: FaTasks, value: (items) => items.length },
      {
        label: "Question sets",
        icon: FaCalendarAlt,
        value: (items) =>
          items.filter((item) => item.name?.trim().toUpperCase().startsWith("Q"))
            .length,
      },
      { label: "Last updated", icon: FaDatabase, value: latestUpdate },
    ],
    toPayload: (form) => ({
      name: form.name.trim(),
      category: form.category,
      submissionDeadline: form.submissionDeadline || null,
      requiresClassSubject: Boolean(form.requiresClassSubject),
      description: form.description.trim(),
    }),
  },
};

function latestUpdate(items) {
  const dates = items
    .map((item) => item.updatedAt || item.createdAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a));
  return formatDate(dates[0]);
}

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatFieldValue = (item, key) => {
  const value = item[key];
  if (key === "updated") return formatDate(item.updatedAt || item.createdAt);
  if (key === "submissionDeadline") return formatDate(value);
  if (key === "requiresClassSubject") return value ? "Required" : "Optional";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  if (value === null || value === undefined || value === "") return "-";
  return value;
};

const getSearchValue = (item, key) => {
  const value = item[key];
  if (key === "submissionDeadline") return formatDate(value);
  if (Array.isArray(value)) return value.join(", ");
  return value || "";
};

const normalizeItemForForm = (config, item) =>
  Object.fromEntries(
    config.fields.map((field) => {
      const value = item[field.key];
      if (field.type === "date") return [field.key, toDateInputValue(value)];
      if (field.type === "checkbox")
        return [field.key, value === undefined ? true : Boolean(value)];
      if (Array.isArray(value)) return [field.key, value.join(", ")];
      return [field.key, value ?? config.defaults[field.key] ?? ""];
    })
  );

const StatPanel = ({ icon: Icon, label, value }) => (
  <div className="border border-slate-200 bg-white p-4">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700">
        <Icon />
      </div>
    </div>
  </div>
);

const FormField = ({ field, value, onChange }) => {
  if (field.type === "select") {
    return (
      <label className="space-y-1.5">
        <span className="text-sm font-medium text-slate-700">
          {field.label} {field.required && <span className="text-rose-500">*</span>}
        </span>
        <select
          value={value}
          onChange={(event) => onChange(field.key, event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
        >
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex min-h-[44px] items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2.5">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field.key, event.target.checked)}
          className="h-4 w-4 accent-teal-700"
        />
        <span className="text-sm font-medium text-slate-700">{field.label}</span>
      </label>
    );
  }

  return (
    <label className="space-y-1.5">
      <span className="text-sm font-medium text-slate-700">
        {field.label} {field.required && <span className="text-rose-500">*</span>}
      </span>
      <input
        type={field.type || "text"}
        value={value}
        onChange={(event) => onChange(field.key, event.target.value)}
        placeholder={field.placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
      />
    </label>
  );
};

const EmptyState = ({ onBack }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6">
    <div className="w-full max-w-lg border border-rose-100 bg-white p-8 text-center">
      <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-lg bg-rose-50 text-rose-500 sm:h-20 sm:w-20">
        <FaShieldAlt className="text-3xl sm:text-4xl" />
      </div>
      <h2 className="mb-6 text-xl font-bold text-slate-900 sm:text-2xl">
        Access Restricted
      </h2>
      <Button onClick={onBack} variant="primary" className="w-full sm:w-auto">
        Return to Dashboard
      </Button>
    </div>
  </div>
);

const MasterSetupPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const config = setupConfig[type];
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(config?.defaults || {});
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!config) return;
    setFormData(config.defaults);
    setEditingId(null);
    setSearch("");
  }, [config, type]);

  useEffect(() => {
    if (!config) return;

    const loadItems = async () => {
      setLoading(true);
      try {
        const { data } = await getMasterDataList(type);
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(`Failed to load ${config.itemLabel.toLowerCase()} records.`);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [config, type]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      config.searchKeys
        .map((key) => getSearchValue(item, key))
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [config, items, search]);

  if (!config) {
    return <EmptyState onBack={() => navigate("/dashboard")} />;
  }

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData(config.defaults);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const missingField = config.fields.find(
      (field) => field.required && !String(formData[field.key] || "").trim()
    );
    if (missingField) {
      toast.error(`${missingField.label} is required.`);
      return;
    }

    setSaving(true);
    try {
      const payload = config.toPayload(formData);
      if (editingId) {
        const { data } = await updateMasterData(type, editingId, payload);
        setItems((prev) =>
          prev.map((item) => (item._id === editingId ? data : item))
        );
        toast.success(`${config.itemLabel} updated.`);
      } else {
        const { data } = await addMasterData(type, payload);
        setItems((prev) => [...prev, data]);
        toast.success(`${config.itemLabel} added.`);
      }
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData(normalizeItemForForm(config, item));
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Remove ${item.name}?`)) return;
    try {
      await deleteMasterData(type, item._id);
      setItems((prev) => prev.filter((record) => record._id !== item._id));
      if (editingId === item._id) resetForm();
      toast.success(`${config.itemLabel} removed.`);
    } catch (error) {
      toast.error("Delete failed.");
    }
  };

  return (
    <div className="min-h-screen bg-transparent px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px] space-y-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 flex-none place-items-center rounded-lg bg-slate-900 text-white">
              <config.icon />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {config.title}
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {config.subtitle}
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate("/dashboard")}
            variant="secondary"
            className="w-fit"
          >
            <FaChevronLeft size={12} />
            Go Back
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {config.stats.map((stat) => (
            <StatPanel
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value(items)}
            />
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-slate-200 bg-white p-5"
        >
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? config.editTitle : config.addTitle}
              </h2>
              <p className="text-sm text-slate-500">
                Changes apply immediately to reports, filters, and assignment
                screens.
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <FaTimes size={12} />
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:items-end">
            {config.fields.map((field) => (
              <FormField
                key={field.key}
                field={field}
                value={formData[field.key]}
                onChange={handleChange}
              />
            ))}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {saving ? (
                <FaSyncAlt className="animate-spin" size={13} />
              ) : editingId ? (
                <FaSave size={13} />
              ) : (
                <FaPlus size={13} />
              )}
              {editingId ? "Update" : "Add"}
            </button>
          </div>
        </form>

        <section className="border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Saved {config.itemLabel}s
              </h2>
              <p className="text-sm text-slate-500">
                {filteredItems.length} of {items.length} records shown
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={config.searchPlaceholder}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  {config.columns.map((column) => (
                    <th
                      key={column.key}
                      className="border-b border-slate-200 px-5 py-3 text-left text-xs font-semibold text-slate-500"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="border-b border-slate-200 px-5 py-3 text-right text-xs font-semibold text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={config.columns.length + 1}
                      className="px-5 py-12 text-center text-sm font-semibold text-slate-500"
                    >
                      Loading records...
                    </td>
                  </tr>
                ) : filteredItems.length ? (
                  filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      {config.columns.map((column) => (
                        <td
                          key={column.key}
                          className={`border-b border-slate-100 px-5 py-4 text-sm ${
                            column.strong
                              ? "font-bold text-slate-900"
                              : "text-slate-700"
                          }`}
                        >
                          {formatFieldValue(item, column.key)}
                        </td>
                      ))}
                      <td className="border-b border-slate-100 px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-teal-50 hover:text-teal-700"
                          >
                            <FaEdit size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            title="Delete"
                            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <FaTrash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={config.columns.length + 1}
                      className="px-5 py-12 text-center text-sm font-semibold text-slate-500"
                    >
                      {config.emptyMessage}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-200 md:hidden">
            {loading ? (
              <div className="p-6 text-center text-sm font-semibold text-slate-500">
                Loading records...
              </div>
            ) : filteredItems.length ? (
              filteredItems.map((item) => (
                <div key={item._id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {config.columns
                          .slice(1, 3)
                          .map((column) => formatFieldValue(item, column.key))
                          .filter((value) => value !== "-")
                          .join(" | ") || "No extra details"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        title="Edit"
                        className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500"
                      >
                        <FaEdit size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        title="Delete"
                        className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500"
                      >
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-medium text-slate-400">
                    Updated {formatDate(item.updatedAt || item.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm font-semibold text-slate-500">
                {config.emptyMessage}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MasterSetupPage;
