import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaUserEdit,
  FaSyncAlt,
  FaUser,
  FaBuilding,
  FaPhone,
  FaIdCard,
  FaSave,
  FaTerminal,
  FaShieldAlt,
  FaToggleOn,
} from "react-icons/fa";

// Reusable UI Components
import InputField from "../ui/InputField";
import SelectDropdown from "../ui/SelectDropdown";
import Button from "../ui/Button";

import {
  getTeacherProfile,
  updateTeacher,
  getBranches,
} from "../../api/apiService";

const UpdateTeacherForm = ({ teacherId, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    teacherId: "",
    name: "",
    phone: "",
    campus: "",
    designation: "",
    isActive: true,
  });
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!teacherId) return;
      try {
        const [teacherRes, branchesRes] = await Promise.all([
          getTeacherProfile(teacherId),
          getBranches(),
        ]);

        const teacherDetails = teacherRes.data.teacherDetails;
        setFormData({
          teacherId: teacherDetails.teacherId,
          name: teacherDetails.name,
          phone: teacherDetails.phone,
          campus: teacherDetails.campus._id,
          designation: teacherDetails.designation || "",
          isActive: teacherDetails.isActive,
        });

        setBranches(branchesRes.data);
      } catch (error) {
        toast.error("Failed to load initial data buffer.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [teacherId]);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Required";
    if (!formData.phone) newErrors.phone = "Required";
    if (!formData.campus) newErrors.campus = "Required";
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
    setSubmitting(true);

    try {
      const response = await updateTeacher(teacherId, formData);
      toast.success(`Profile updated: ${response.data.teacher.name}`);
      if (onUpdateSuccess) onUpdateSuccess(response.data.teacher);
    } catch (error) {
      const msg = error.response?.data?.message || "Update failed.";
      if (msg.includes("already in use"))
        setErrors({ phone: "Conflict detected" });
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white/40 backdrop-blur-md rounded-[3rem]">
        <FaSyncAlt className="animate-spin text-6xl text-indigo-500/20 mb-6" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">
          Synchronizing Registry
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-1 shadow-sm border border-slate-100 group transition-all duration-500 hover:shadow-indigo-100/50">
      <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-3 transition-transform group-hover:rotate-0">
              <FaUserEdit size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                Modify Profile
              </h2>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                <FaTerminal className="text-indigo-500" /> Node:{" "}
                {formData.teacherId}
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <div
              className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors ${
                formData.isActive
                  ? "bg-green-50 text-green-600 border-green-100"
                  : "bg-rose-50 text-rose-600 border-rose-100"
              }`}
            >
              {formData.isActive ? "Status: Active" : "Status: Dormant"}
            </div>
          </div>
        </div>

        {/* --- INPUT GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Neural Identifier (Locked)"
            name="teacherId"
            icon={FaIdCard}
            value={formData.teacherId}
            disabled
            className="bg-slate-100/50 border-slate-100 text-slate-400 rounded-2xl font-bold cursor-not-allowed"
          />

          <InputField
            label="Full Legal Name"
            name="name"
            icon={FaUser}
            placeholder="Edit Name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            className="bg-slate-50/50 border-slate-100 rounded-2xl font-bold"
          />

          <SelectDropdown
            label="Primary Station"
            name="campus"
            icon={FaBuilding}
            options={branches}
            value={formData.campus}
            onChange={handleChange}
            error={errors.campus}
            required
          />

          <InputField
            label="Contact String"
            name="phone"
            icon={FaPhone}
            placeholder="Numerical Code"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            required
          />
        </div>

        <InputField
          label="Institutional Designation"
          name="designation"
          placeholder="Senior Teacher"
          value={formData.designation}
          onChange={handleChange}
        />

        {/* --- TOGGLE AREA --- */}
        <div className="bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                formData.isActive
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              <FaToggleOn size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">
                Active Availability
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                Toggle readiness for responsibility matrix
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-12 h-6 rounded-full appearance-none bg-slate-200 checked:bg-indigo-600 transition-all cursor-pointer relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all checked:after:translate-x-6 shadow-inner"
          />
        </div>

        {/* --- ACTION BUTTON --- */}
        <div className="pt-4 flex flex-col md:flex-row items-center gap-6">
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-2/3 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:shadow-indigo-200 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <FaSyncAlt className="animate-spin" />
            ) : (
              <>
                <FaSave className="text-xs" /> Finalize Registry
              </>
            )}
          </button>

          <div className="flex items-center gap-3 text-slate-400">
            <FaShieldAlt size={14} />
            <p className="text-[9px] font-bold uppercase tracking-widest leading-tight">
              Encrypted write <br /> Authorization required.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateTeacherForm;
