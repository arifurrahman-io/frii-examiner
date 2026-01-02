import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaUser,
  FaBuilding,
  FaPhone,
  FaIdCard,
  FaUserTie,
  FaSyncAlt,
  FaFingerprint,
  FaSave,
  FaEthernet,
} from "react-icons/fa";

// Reusable UI Components
import InputField from "../ui/InputField";
import SelectDropdown from "../ui/SelectDropdown";
import { addTeacher, getBranches } from "../../api/apiService";
import { useAuth } from "../../context/AuthContext";

const initialFormData = {
  teacherId: "",
  name: "",
  phone: "",
  campus: "",
  designation: "",
};

const AddTeacherForm = ({ onSaveSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isAdmin = user?.role === "admin";
  const isIncharge = user?.role === "incharge";

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data } = await getBranches();
        setBranches(data);

        if (isIncharge && user?.campus) {
          const campusId = user.campus._id || user.campus;
          setFormData((prev) => ({ ...prev, campus: campusId }));
        }
      } catch (error) {
        toast.error("Network Sync Failure.");
      }
    };
    fetchBranches();
  }, [isIncharge, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "ID Required";
    if (!formData.teacherId.trim()) newErrors.teacherId = "Node Required";
    if (!formData.campus) newErrors.campus = "Link Required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Comm Required";
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Digits only";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Parameter mismatch.");
      return;
    }

    setLoading(true);
    try {
      const response = await addTeacher(formData);
      toast.success(`${response.data.name} synchronized.`);
      setFormData({
        ...initialFormData,
        campus: isIncharge ? user.campus._id || user.campus : "",
      });
      if (onSaveSuccess) onSaveSuccess(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Protocol Error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto my-8">
      {/* Dynamic Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-[3rem] blur-2xl"></div>

      <div className="relative bg-white/90 backdrop-blur-2xl rounded-[3rem] border border-white/50 shadow-2xl overflow-hidden transition-all duration-500">
        <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-12">
          {/* --- HEADER SECTION --- */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-8 mb-4">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-100/50">
                <FaFingerprint size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">
                  Teacher Registration
                </h2>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mt-2">
                  System Mode: {isAdmin ? "Global Admin" : "Shift Incharge"}
                </p>
              </div>
            </div>

            {isIncharge && (
              <div className="flex items-center gap-3 px-5 py-2.5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <FaEthernet className="text-indigo-500" size={12} />
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                  {user?.campus?.name || "Local Node"}
                </span>
              </div>
            )}
          </div>

          {/* --- INPUT GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
            {/* Full Name - Spans full width if incharge to create balanced whitespace */}
            <div className={isIncharge ? "md:col-span-2" : ""}>
              <InputField
                label="Teacher's Name"
                name="name"
                icon={FaUser}
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                className="bg-slate-50/50 border-slate-100/50 rounded-2xl h-14 text-sm font-semibold px-6"
              />
            </div>

            {/* Staff ID */}
            <InputField
              label="Teacher's ID"
              name="teacherId"
              icon={FaIdCard}
              placeholder="T68****15116"
              value={formData.teacherId}
              onChange={handleChange}
              error={errors.teacherId}
              required
              className="bg-slate-50/50 border-slate-100/50 rounded-2xl h-14 text-sm font-semibold px-6"
            />

            {/* Campus Select (Only for Global Admin) */}
            {!isIncharge ? (
              <SelectDropdown
                label="Campus/Shift"
                name="campus"
                icon={FaBuilding}
                options={branches}
                value={formData.campus}
                onChange={handleChange}
                error={errors.campus}
                required
                className="bg-slate-50/50 border-slate-100/50 rounded-2xl h-14 text-sm font-semibold"
              />
            ) : (
              /* If Incharge, Phone sits next to ID for balanced padding */
              <InputField
                label="Phone Number"
                name="phone"
                icon={FaPhone}
                placeholder="0168***6151"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
                className="bg-slate-50/50 border-slate-100/50 rounded-2xl h-14 text-sm font-semibold px-6"
              />
            )}

            {/* Admin only fields for balanced 2-column flow */}
            {!isIncharge && (
              <>
                <InputField
                  label="Communication Line"
                  name="phone"
                  icon={FaPhone}
                  placeholder="Contact Matrix"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                  className="bg-slate-50/50 border-slate-100/50 rounded-2xl h-14 text-sm font-semibold px-6"
                />
                <InputField
                  label="Institutional Designation"
                  name="designation"
                  icon={FaUserTie}
                  placeholder="Meta Role Assignment"
                  value={formData.designation}
                  onChange={handleChange}
                  className="bg-slate-50/50 border-slate-100/50 rounded-2xl h-14 text-sm font-semibold px-6"
                />
              </>
            )}
          </div>

          {/* --- ACTION SECTION --- */}
          <div className="pt-10 border-t border-slate-100 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-[1.5rem] bg-slate-900 py-5 text-white shadow-2xl transition-all hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-70"
            >
              <div className="relative flex items-center justify-center gap-4 font-black uppercase tracking-[0.3em] text-[13px]">
                {loading ? (
                  <FaSyncAlt className="animate-spin" />
                ) : (
                  <>
                    <FaSave /> <span>Add Teacher</span>
                  </>
                )}
              </div>
            </button>

            <div className="mt-8 flex flex-col items-center gap-2">
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em]">
                Institutional Security Protocol V2.5.1
              </p>
              <div className="h-1 w-20 bg-indigo-50 rounded-full"></div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeacherForm;
