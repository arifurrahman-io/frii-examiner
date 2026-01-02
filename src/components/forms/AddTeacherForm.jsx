import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaUserPlus,
  FaSave,
  FaUser,
  FaBuilding,
  FaPhone,
  FaIdCard,
  FaUserTie,
  FaTerminal,
  FaSyncAlt,
} from "react-icons/fa";

// Reusable UI Components
import InputField from "../ui/InputField";
import SelectDropdown from "../ui/SelectDropdown";
import Button from "../ui/Button";

import { addTeacher, getBranches } from "../../api/apiService";

const initialFormData = {
  teacherId: "",
  name: "",
  phone: "",
  campus: "",
  designation: "",
};

const AddTeacherForm = ({ onSaveSuccess }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data } = await getBranches();
        setBranches(data);
      } catch (error) {
        toast.error("Failed to load campus data matrix.");
      }
    };
    fetchBranches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Required";
    if (!formData.teacherId) newErrors.teacherId = "Required";
    if (!formData.campus) newErrors.campus = "Required";
    if (!formData.phone) newErrors.phone = "Required";
    if (formData.phone && !/^\d+$/.test(formData.phone))
      newErrors.phone = "Digits only";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Review highlighted parameters.");
      return;
    }

    setLoading(true);
    try {
      const response = await addTeacher(formData);
      toast.success(`${response.data.name} indexed successfully!`);
      setFormData(initialFormData);
      if (onSaveSuccess) onSaveSuccess(response.data);
    } catch (error) {
      const msg = error.response?.data?.message || "Operation failed.";
      if (msg.includes("registered")) setErrors({ phone: "Conflict detected" });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-1 shadow-sm border border-slate-100 group transition-all duration-500 hover:shadow-indigo-100/50">
      <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-3 transition-transform group-hover:rotate-0">
              <FaUserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                Add Staff
              </h2>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                <FaTerminal className="text-indigo-500" /> Neural Record Entry
              </p>
            </div>
          </div>
        </div>

        {/* --- INPUT GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Full Name"
            name="name"
            icon={FaUser}
            placeholder="Legal Name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            className="bg-slate-50/50 border-slate-100 rounded-2xl font-bold"
          />

          <InputField
            label="Staff ID"
            name="teacherId"
            icon={FaIdCard}
            placeholder="Unique Node ID"
            value={formData.teacherId}
            onChange={handleChange}
            error={errors.teacherId}
            required
          />

          <SelectDropdown
            label="Deployment Campus"
            name="campus"
            icon={FaBuilding}
            options={branches}
            value={formData.campus}
            onChange={handleChange}
            error={errors.campus}
            placeholder="Select Station"
            required
          />

          <InputField
            label="Contact Line"
            name="phone"
            icon={FaPhone}
            placeholder="Numerical String"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            required
          />
        </div>

        <div className="pt-2">
          <InputField
            label="Designation (Metadata)"
            name="designation"
            icon={FaUserTie}
            placeholder="e.g., Senior Faculty"
            value={formData.designation}
            onChange={handleChange}
          />
        </div>

        {/* --- ACTION BUTTON --- */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:shadow-indigo-200 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <FaSyncAlt className="animate-spin" />
            ) : (
              <>
                <FaSave className="text-xs" />
                Synchronize Profile
              </>
            )}
          </button>

          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center mt-6">
            Authorized Personnel only
          </p>
        </div>
      </form>
    </div>
  );
};

export default AddTeacherForm;
