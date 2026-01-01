import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaBuilding,
  FaList,
  FaBookOpen,
  FaTasks,
  FaTerminal,
  FaInfoCircle,
  FaSyncAlt,
} from "react-icons/fa";
import { addMasterData } from "../../api/apiService";

// Reusable UI Components
import InputField from "../ui/InputField";
import SelectDropdown from "../ui/SelectDropdown";

const MasterEntryForm = ({ type, onSaveSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const categoryOptions = [
    { _id: "Examination", name: "Examination" },
    { _id: "Administrative", name: "Administrative" },
    { _id: "Academic", name: "Academic" },
    { _id: "Co-curricular", name: "Co-curricular" },
    { _id: "Other", name: "Other" },
  ];

  const titles = {
    branch: {
      title: "New Campus",
      placeholder: "e.g., Dhaka Campus",
      icon: FaBuilding,
    },
    class: { title: "New Class", placeholder: "e.g., Class 9", icon: FaList },
    subject: {
      title: "New Subject",
      placeholder: "e.g., Mathematics",
      icon: FaBookOpen,
    },
    responsibility: {
      title: "New Duty Prototype",
      placeholder: "e.g., Coordinator",
      icon: FaTasks,
    },
  };

  const currentConfig = titles[type] || {
    title: "Master Entry",
    placeholder: "Name",
    icon: FaPlus,
  };

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Required";
    if (type === "class" && (!level || isNaN(level))) errors.level = "Required";
    if (type === "subject" && !code.trim()) errors.code = "Required";
    if (type === "responsibility" && !category) errors.category = "Required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Validation failed. Check required fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        ...(type === "class" && { level: parseInt(level) }),
        ...(type === "subject" && { code: code.trim() }),
        ...(type === "responsibility" && { category: category }),
      };

      await addMasterData(type, payload);
      toast.success(`${type.toUpperCase()} indexed successfully!`);

      setName("");
      setDescription("");
      setLevel("");
      setCode("");
      setCategory("");
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[3rem] p-1 shadow-sm border border-slate-100 overflow-hidden">
      <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
        {/* --- UNIFIED SINGLE HEADER --- */}
        <div className="flex items-center gap-5 border-b border-slate-50 pb-8">
          <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-3 transition-transform hover:rotate-0">
            <currentConfig.icon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
              {currentConfig.title}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
              <FaTerminal className="text-indigo-500" /> INITIALIZE NEURAL
              RECORD
            </p>
          </div>
        </div>

        {/* --- INPUT ROW 1 --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div
            className={`${
              type === "branch" ? "md:col-span-12" : "md:col-span-8"
            }`}
          >
            <InputField
              label={currentConfig.title}
              type="text"
              placeholder={currentConfig.placeholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
              className="bg-slate-50/50 border-slate-100 rounded-2xl font-bold"
            />
          </div>

          {type !== "branch" && (
            <div className="md:col-span-4">
              {type === "class" && (
                <InputField
                  label="Level"
                  type="number"
                  placeholder="ID (e.g. 9)"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  error={fieldErrors.level}
                />
              )}
              {type === "subject" && (
                <InputField
                  label="Code"
                  type="text"
                  placeholder="e.g. MAT"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  error={fieldErrors.code}
                />
              )}
              {type === "responsibility" && (
                <SelectDropdown
                  label="Category"
                  options={categoryOptions}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  error={fieldErrors.category}
                />
              )}
            </div>
          )}
        </div>

        {/* --- INPUT ROW 2 + BUTTON --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-9">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">
              NARRATIVE DESCRIPTION (OPTIONAL)
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contextual metadata..."
                rows="1"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-sm outline-none resize-none"
              />
              <FaInfoCircle className="absolute right-4 top-4 text-slate-200" />
            </div>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <FaSyncAlt className="animate-spin" /> : "INDEXING"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MasterEntryForm;
